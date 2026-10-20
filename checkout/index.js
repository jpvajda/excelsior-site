const STRIPE_VERSION = "2026-09-30.endive";
const PLAN_KEYS = {
  starter: "PRICE_STARTER",
  session: "PRICE_SESSION",
  "pack-6": "PRICE_PACK_6",
  "pack-12": "PRICE_PACK_12",
};

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function json(body, status, origin, allowed) {
  const headers = { "Content-Type": "application/json" };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function integrationId() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let suffix = "";
  for (const byte of bytes) suffix += letters[byte % 26];
  return `excelsior_checkout_${suffix}`;
}

async function tokensMatch(provided, expected) {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
  }
  const left = new Uint8Array(providedHash);
  const right = new Uint8Array(expectedHash);
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

async function hmacHex(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signatureValid(secret, payload, header) {
  if (!secret || !header) return false;
  let timestamp = "";
  const signatures = [];
  for (const piece of header.split(",")) {
    const [key, value] = piece.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!timestamp || !Number.isFinite(age) || age > 300) return false;
  const expected = await hmacHex(secret, `${timestamp}.${payload}`);
  for (const signature of signatures) {
    if (await tokensMatch(signature, expected)) return true;
  }
  return false;
}

async function stripeRequest(env, method, path, params) {
  const headers = {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Stripe-Version": STRIPE_VERSION,
  };
  let body;
  if (params) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body =
      params instanceof URLSearchParams
        ? params.toString().replaceAll("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}")
        : params;
  }
  const response = await fetch(`https://api.stripe.com${path}`, { method, headers, body });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("stripe");
    error.detail = text.slice(0, 300);
    throw error;
  }
  return JSON.parse(text);
}

async function customersFor(env, email) {
  const found = await stripeRequest(
    env,
    "GET",
    `/v1/customers?email=${encodeURIComponent(email)}&limit=10`,
  );
  return found.data || [];
}

async function paidStarterSessions(env, email) {
  return paidSessionsForCustomers(env, await customersFor(env, email));
}

async function paidSessionsForCustomers(env, customers) {
  const paid = [];
  for (const customer of customers) {
    let startingAfter = "";
    for (let page = 0; page < 5; page += 1) {
      const query = new URLSearchParams({
        customer: customer.id,
        status: "complete",
        limit: "100",
      });
      if (startingAfter) query.set("starting_after", startingAfter);
      const sessions = await stripeRequest(env, "GET", `/v1/checkout/sessions?${query}`);
      for (const session of sessions.data || []) {
        if (session.metadata?.plan === "starter" && session.payment_status === "paid") {
          paid.push(session);
        }
      }
      if (!sessions.has_more || !sessions.data?.length) break;
      startingAfter = sessions.data[sessions.data.length - 1].id;
    }
  }
  paid.sort((left, right) => left.created - right.created);
  return paid;
}

function sessionEmail(session) {
  return String(
    session.customer_details?.email || session.customer_email || session.metadata?.email || "",
  )
    .trim()
    .toLowerCase();
}

async function refundPayment(env, paymentIntent) {
  if (!paymentIntent || typeof paymentIntent !== "string") return;
  try {
    await stripeRequest(
      env,
      "POST",
      "/v1/refunds",
      new URLSearchParams({ payment_intent: paymentIntent }),
    );
  } catch (error) {
    const detail = String(error.detail || "").toLowerCase();
    if (detail.includes("already been refunded") || detail.includes("charge_already_refunded")) {
      return;
    }
    throw error;
  }
}

async function notify(env, subject, text) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.NOTIFY_EMAIL],
      subject,
      text,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(JSON.stringify({ resendStatus: response.status, detail: detail.slice(0, 300) }));
    return false;
  }
  return true;
}

async function createSession(request, env, origin, allowed) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400, origin, allowed);
  }

  const checkoutHp = typeof payload.checkout_hp === "string" ? payload.checkout_hp.trim() : "";
  if (checkoutHp) {
    return json({ ok: true, url: env.SUCCESS_URL }, 200, origin, allowed);
  }

  const plan = typeof payload.plan === "string" ? payload.plan : "";
  const priceId = env[PLAN_KEYS[plan]];
  if (!priceId) return json({ ok: false }, 400, origin, allowed);

  if (!env.STRIPE_SECRET_KEY || !env.SUCCESS_URL || !env.CANCEL_URL) {
    return json({ ok: false }, 500, origin, allowed);
  }

  try {
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", env.CANCEL_URL);
    params.set("metadata[plan]", plan);
    params.set("integration_identifier", integrationId());
    params.set("customer_creation", "always");

    const session = await stripeRequest(env, "POST", "/v1/checkout/sessions", params);
    if (!session.url) return json({ ok: false }, 502, origin, allowed);
    return json({ ok: true, url: session.url }, 200, origin, allowed);
  } catch (error) {
    console.error(JSON.stringify({ stripe: String(error.detail || error.message).slice(0, 300) }));
    return json({ ok: false }, 502, origin, allowed);
  }
}

async function handleWebhook(request, env) {
  const payload = await request.text();
  const valid = await signatureValid(
    env.STRIPE_WEBHOOK_SECRET,
    payload,
    request.headers.get("stripe-signature"),
  );
  if (!valid) return new Response("invalid signature", { status: 400 });

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("invalid payload", { status: 400 });
  }

  const session = event.data?.object;
  const watched =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";
  if (!watched || !session || session.payment_status !== "paid") {
    return new Response("ok", { status: 200 });
  }

  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.NOTIFY_EMAIL) {
    return new Response("missing mail config", { status: 500 });
  }

  const email = sessionEmail(session);
  const plan = session.metadata?.plan || "session";
  const amount = (Number(session.amount_total || 0) / 100).toFixed(2);
  let refunded = false;

  try {
    if (plan === "starter" && email) {
      const paid = await paidStarterSessions(env, email);
      const keeper = paid[0];
      if (keeper && keeper.id !== session.id) {
        await refundPayment(env, session.payment_intent);
        refunded = true;
      } else if (keeper && keeper.id === session.id) {
        for (const extra of paid.slice(1)) {
          await refundPayment(env, extra.payment_intent);
        }
      }
    }
  } catch (error) {
    console.error(JSON.stringify({ stripe: String(error.detail || error.message).slice(0, 300) }));
    return new Response("stripe", { status: 500 });
  }

  const subject = refunded ? "Duplicate starter refunded" : `Paid: ${plan}`;
  const text = refunded
    ? `A second starter payment was refunded.\nEmail: ${email}\nSession: ${session.id}`
    : `${plan} paid.\nEmail: ${email || "not collected"}\nSession: ${session.id}\nAmount: $${amount}`;
  const sent = await notify(env, subject, text);
  return new Response(sent ? "ok" : "mail", { status: sent ? 200 : 500 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/webhook") {
      if (request.method !== "POST") return new Response("method", { status: 405 });
      return handleWebhook(request, env);
    }

    const origin = request.headers.get("Origin");
    const allowed = allowedOrigins(env);

    if (request.method === "OPTIONS") {
      if (!allowed.includes(origin)) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          Vary: "Origin",
        },
      });
    }

    if (request.method !== "POST") return json({ ok: false }, 405, origin, allowed);
    if (!allowed.includes(origin)) return json({ ok: false }, 403, origin, allowed);
    return createSession(request, env, origin, allowed);
  },
};
