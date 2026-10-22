import { readFileSync } from "node:fs";
import worker from "../worker/index.js";
import { expect, test } from "@playwright/test";

function allowedOrigins() {
  const toml = readFileSync("worker/wrangler.toml", "utf8");
  const match = toml.match(/ALLOWED_ORIGINS = "([^"]+)"/);
  return match[1];
}

function limiter(limit = 10) {
  const counts = new Map();
  return {
    async limit({ key }) {
      const next = (counts.get(key) || 0) + 1;
      counts.set(key, next);
      return { success: next <= limit };
    },
  };
}

function env() {
  return {
    ALLOWED_ORIGINS: allowedOrigins(),
    SEGMENT_ID: "461c1f7e-405b-44e4-a778-5650d710e8c5",
    RESEND_API_KEY: "test-key",
    SIGNUP_RATE_LIMITER: limiter(),
  };
}

function post(body, ip = "203.0.113.10") {
  return new Request("https://signup.test/", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3000",
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
    },
    body: JSON.stringify(body),
  });
}

test("local and production pages can call the signup worker", async () => {
  const origins = allowedOrigins().split(",");
  expect(origins).toEqual([
    "https://excelsior-prt.com",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ]);

  for (const origin of origins) {
    const response = await worker.fetch(
      new Request("https://signup.test/", {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      }),
      env(),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  }

  const blocked = await worker.fetch(
    new Request("https://signup.test/", {
      method: "OPTIONS",
      headers: { Origin: "https://example.com", "Access-Control-Request-Method": "POST" },
    }),
    env(),
  );
  expect(blocked.status).toBe(403);
  expect(blocked.headers.get("Access-Control-Allow-Origin")).toBeNull();
});

test("only the honeypot field skips Resend", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return new Response("{}", { status: 200 });
  };

  try {
    const skipped = await worker.fetch(
      post({ email: "reader@example.com", signup_hp: "filled" }),
      env(),
    );
    expect(skipped.status).toBe(200);
    expect(calls).toEqual([]);

    const sent = await worker.fetch(
      post({ email: "reader@example.com", signup_hp: "", company: "Autofill Co" }),
      env(),
    );
    expect(sent.status).toBe(200);
    expect(calls).toEqual([
      {
        url: "https://api.resend.com/contacts",
        body: {
          email: "reader@example.com",
          segments: [{ id: "461c1f7e-405b-44e4-a778-5650d710e8c5" }],
        },
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the eleventh signup from one address is refused", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return new Response("{}", { status: 200 });
  };

  try {
    const settings = env();
    for (let n = 0; n < 10; n += 1) {
      const response = await worker.fetch(
        post({ email: `reader${n}@example.com`, signup_hp: "" }, "203.0.113.11"),
        settings,
      );
      expect(response.status).toBe(200);
    }
    expect(calls).toHaveLength(10);

    const blocked = await worker.fetch(
      post({ email: "reader11@example.com", signup_hp: "" }, "203.0.113.11"),
      settings,
    );
    expect(blocked.status).toBe(429);
    expect(calls).toHaveLength(10);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a resend error log drops the email", async () => {
  const logs = [];
  const originalLog = console.log;
  const originalFetch = globalThis.fetch;
  console.log = (line) => logs.push(String(line));
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ name: "validation_error", message: "Invalid reader@example.com" }), {
      status: 422,
    });

  try {
    const response = await worker.fetch(post({ email: "reader@example.com", signup_hp: "" }), env());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false });
    expect(logs.join("")).not.toContain("@");
    expect(logs.join("")).toContain("422");
  } finally {
    console.log = originalLog;
    globalThis.fetch = originalFetch;
  }
});

test("a missing rate limiter does not call Resend", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response("{}", { status: 200 });
  };

  try {
    const settings = env();
    delete settings.SIGNUP_RATE_LIMITER;
    const response = await worker.fetch(post({ email: "reader@example.com", signup_hp: "" }), settings);
    expect(response.status).toBe(500);
    expect(calls).toEqual([]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
