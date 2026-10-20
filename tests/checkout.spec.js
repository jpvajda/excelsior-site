import { readFileSync } from "node:fs";
import worker from "../checkout/index.js";
import { expect, test } from "@playwright/test";

function tomlValue(key) {
  const toml = readFileSync("checkout/wrangler.toml", "utf8");
  const match = toml.match(new RegExp(`${key} = "([^"]+)"`));
  return match[1];
}

function env() {
  return {
    ALLOWED_ORIGINS: tomlValue("ALLOWED_ORIGINS"),
    SUCCESS_URL: tomlValue("SUCCESS_URL"),
    CANCEL_URL: tomlValue("CANCEL_URL"),
    NOTIFY_EMAIL: tomlValue("NOTIFY_EMAIL"),
    FROM_EMAIL: tomlValue("FROM_EMAIL"),
    PRICE_STARTER: tomlValue("PRICE_STARTER"),
    PRICE_SESSION: tomlValue("PRICE_SESSION"),
    PRICE_PACK_6: tomlValue("PRICE_PACK_6"),
    PRICE_PACK_12: tomlValue("PRICE_PACK_12"),
    STRIPE_SECRET_KEY: "sk_test_x",
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    RESEND_API_KEY: "re_test",
  };
}

function post(body, origin = "http://localhost:3000") {
  return new Request("https://checkout.test/", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function stripeSignature(secret, payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const hex = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `t=${timestamp},v1=${hex}`;
}

test("local and production pages can call the checkout worker", async () => {
  const origins = tomlValue("ALLOWED_ORIGINS").split(",");
  expect(origins).toEqual([
    "https://excelsior-prt.com",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ]);

  for (const origin of origins) {
    const response = await worker.fetch(
      new Request("https://checkout.test/", {
        method: "OPTIONS",
        headers: { Origin: origin, "Access-Control-Request-Method": "POST" },
      }),
      env(),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  }
});

test("the browser cannot set the price", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body || "" });
    return new Response(JSON.stringify({ url: "https://checkout.stripe.com/c/pay/cs_test" }), {
      status: 200,
    });
  };

  try {
    const response = await worker.fetch(
      post({ plan: "session", email: "", checkout_hp: "", price: "price_evil", amount: 50 }),
      env(),
    );
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect(calls[0].body).toContain(tomlValue("PRICE_SESSION"));
    expect(calls[0].body).not.toContain("price_evil");
    expect(calls[0].body).toContain("{CHECKOUT_SESSION_ID}");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("starter checkout lets Stripe collect the email", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body || "" });
    return new Response(JSON.stringify({ id: "cs_new", url: "https://checkout.stripe.com/c/pay/cs_new" }), {
      status: 200,
    });
  };

  try {
    const response = await worker.fetch(post({ plan: "starter", checkout_hp: "", email: "reader@example.com" }), env());
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect(calls[0].body).toContain("customer_creation=always");
    expect(calls[0].body).not.toContain("customer_email");
    expect(calls[0].body).toContain(tomlValue("PRICE_STARTER"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("only the honeypot field skips Stripe", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response("{}", { status: 200 });
  };

  try {
    const skipped = await worker.fetch(
      post({ plan: "starter", email: "reader@example.com", checkout_hp: "filled" }),
      env(),
    );
    expect(skipped.status).toBe(200);
    expect(calls).toEqual([]);

    const unknown = await worker.fetch(post({ plan: "nope", email: "", checkout_hp: "" }), env());
    expect(unknown.status).toBe(400);
    expect(calls).toEqual([]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a paid webhook emails the coach and refunds a second starter", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body || "" });
    if (String(url).includes("/v1/customers")) {
      return new Response(JSON.stringify({ data: [{ id: "cus_1" }] }), { status: 200 });
    }
    if (String(url).includes("/v1/checkout/sessions")) {
      return new Response(
        JSON.stringify({
          data: [
            {
              id: "cs_old",
              created: 1,
              metadata: { plan: "starter" },
              payment_status: "paid",
              payment_intent: "pi_old",
            },
            {
              id: "cs_new",
              created: 2,
              metadata: { plan: "starter" },
              payment_status: "paid",
              payment_intent: "pi_new",
            },
          ],
          has_more: false,
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 200 });
  };

  try {
    const unpaid = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_wait",
          payment_status: "unpaid",
          metadata: { plan: "pack-6" },
          amount_total: 65000,
        },
      },
    };
    const unpaidBody = JSON.stringify(unpaid);
    const ignored = await worker.fetch(
      new Request("https://checkout.test/webhook", {
        method: "POST",
        headers: { "stripe-signature": await stripeSignature("whsec_test", unpaidBody) },
        body: unpaidBody,
      }),
      env(),
    );
    expect(ignored.status).toBe(200);
    expect(calls).toEqual([]);

    const paid = {
      type: "checkout.session.async_payment_succeeded",
      data: {
        object: {
          id: "cs_new",
          payment_status: "paid",
          metadata: { plan: "starter" },
          customer_details: { email: "reader@example.com" },
          amount_total: 8500,
          payment_intent: "pi_new",
        },
      },
    };
    const paidBody = JSON.stringify(paid);
    const response = await worker.fetch(
      new Request("https://checkout.test/webhook", {
        method: "POST",
        headers: { "stripe-signature": await stripeSignature("whsec_test", paidBody) },
        body: paidBody,
      }),
      env(),
    );
    expect(response.status).toBe(200);
    expect(calls.some((call) => call.url === "https://api.stripe.com/v1/refunds" && call.body.includes("pi_new"))).toBe(
      true,
    );
    const mail = calls.find((call) => call.url === "https://api.resend.com/emails");
    expect(JSON.parse(mail.body).subject).toBe("Duplicate starter refunded");

    const forged = await worker.fetch(
      new Request("https://checkout.test/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=deadbeef" },
        body: paidBody,
      }),
      env(),
    );
    expect(forged.status).toBe(400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
