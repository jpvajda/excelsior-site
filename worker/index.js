const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = allowedOrigins(env);

    if (request.method === "OPTIONS") {
      if (!allowed.includes(origin)) {
        return new Response(null, { status: 403 });
      }
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

    if (request.method !== "POST") {
      return json({ ok: false }, 405, origin, allowed);
    }

    if (!allowed.includes(origin)) {
      return json({ ok: false }, 403, origin, allowed);
    }

    if (!env.SIGNUP_RATE_LIMITER || typeof env.SIGNUP_RATE_LIMITER.limit !== "function") {
      return json({ ok: false }, 500, origin, allowed);
    }
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await env.SIGNUP_RATE_LIMITER.limit({ key: ip });
    if (!success) return json({ ok: false }, 429, origin, allowed);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false }, 400, origin, allowed);
    }

    const signupHp = typeof payload.signup_hp === "string" ? payload.signup_hp.trim() : "";
    if (signupHp) {
      return json({ ok: true }, 200, origin, allowed);
    }

    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    if (!EMAIL.test(email) || email.length > 320) {
      return json({ ok: false }, 400, origin, allowed);
    }

    if (!env.RESEND_API_KEY || !env.SEGMENT_ID) {
      return json({ ok: false }, 500, origin, allowed);
    }

    let resendResponse;
    try {
      resendResponse = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          segments: [{ id: env.SEGMENT_ID }],
        }),
      });
    } catch {
      return json({ ok: false }, 502, origin, allowed);
    }

    if (resendResponse.ok) {
      return json({ ok: true }, 200, origin, allowed);
    }

    const detail = await resendResponse.text();
    if (resendResponse.status === 409 || detail.toLowerCase().includes("already exists")) {
      return json({ ok: true }, 200, origin, allowed);
    }

    console.log(
      JSON.stringify({
        resendStatus: resendResponse.status,
        error: safeErrorName(detail),
      }),
    );
    return json({ ok: false }, 502, origin, allowed);
  },
};
