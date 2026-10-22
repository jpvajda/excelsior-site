const STRIPE_VERSION = "2026-09-30.endive";
const PLAN_KEYS = {
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

function safeErrorName(detail) {
  let name = "unknown";
  try {
    const parsed = JSON.parse(detail);
    const value = parsed.name || parsed.message || parsed.error?.message || parsed.error?.type;
    if (value) name = String(value);
  } catch {
    name = "unknown";
  }
  return name.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email]").slice(0, 120);
}

function integrationId() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let suffix = "";
  for (const byte of bytes) suffix += letters[byte % 26];
  return `excelsior_checkout_${suffix}`;
}

async function createCheckoutSession(env, params) {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Stripe-Version": STRIPE_VERSION,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString().replaceAll("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}"),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("stripe");
    error.status = response.status;
    error.detail = text.slice(0, 300);
    throw error;
  }
  return JSON.parse(text);
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
    params.set("allow_promotion_codes", "true");
    params.set("integration_identifier", integrationId());

    const session = await createCheckoutSession(env, params);
    if (!session.url) return json({ ok: false }, 502, origin, allowed);
    return json({ ok: true, url: session.url }, 200, origin, allowed);
  } catch (error) {
    console.error(
      JSON.stringify({
        stripeStatus: error.status || 0,
        error: safeErrorName(String(error.detail || "")),
      }),
    );
    return json({ ok: false }, 502, origin, allowed);
  }
}

export default {
  async fetch(request, env) {
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
