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
    PRICE_SESSION: tomlValue("PRICE_SESSION"),
    PRICE_PACK_6: tomlValue("PRICE_PACK_6"),
    PRICE_PACK_12: tomlValue("PRICE_PACK_12"),
    STRIPE_SECRET_KEY: "sk_test_x",
  };
}

function post(body, origin = "http://localhost:3000") {
  return new Request("https://checkout.test/", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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

test("each plan opens Stripe checkout with a promotion code box", async () => {
  const originalFetch = globalThis.fetch;
  const prices = {
    session: tomlValue("PRICE_SESSION"),
    "pack-6": tomlValue("PRICE_PACK_6"),
    "pack-12": tomlValue("PRICE_PACK_12"),
  };

  try {
    for (const [plan, price] of Object.entries(prices)) {
      const calls = [];
      globalThis.fetch = async (url, init) => {
        calls.push({ url: String(url), body: init?.body || "" });
        return new Response(JSON.stringify({ url: "https://checkout.stripe.com/c/pay/cs_new" }), {
          status: 200,
        });
      };

      const response = await worker.fetch(post({ plan, checkout_hp: "" }), env());
      expect(response.status).toBe(200);
      expect((await response.json()).url).toBe("https://checkout.stripe.com/c/pay/cs_new");
      expect(calls).toHaveLength(1);
      expect(calls[0].body).toContain(encodeURIComponent(price));
      expect(calls[0].body).toContain("allow_promotion_codes=true");
      expect(calls[0].body).not.toContain("customer_email");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the starter session has no checkout", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response("{}", { status: 200 });
  };

  try {
    const starter = await worker.fetch(post({ plan: "starter", checkout_hp: "" }), env());
    expect(starter.status).toBe(400);
    expect(calls).toEqual([]);
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
      post({ plan: "session", email: "reader@example.com", checkout_hp: "filled" }),
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
