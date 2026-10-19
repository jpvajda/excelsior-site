import { readFileSync } from "node:fs";
import worker from "../worker/index.js";
import { expect, test } from "@playwright/test";

function allowedOrigins() {
  const toml = readFileSync("worker/wrangler.toml", "utf8");
  const match = toml.match(/ALLOWED_ORIGINS = "([^"]+)"/);
  return match[1];
}

function env() {
  return {
    ALLOWED_ORIGINS: allowedOrigins(),
    SEGMENT_ID: "461c1f7e-405b-44e4-a778-5650d710e8c5",
    RESEND_API_KEY: "test-key",
  };
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
      new Request("https://signup.test/", {
        method: "POST",
        headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" },
        body: JSON.stringify({ email: "reader@example.com", signup_hp: "filled" }),
      }),
      env(),
    );
    expect(skipped.status).toBe(200);
    expect(calls).toEqual([]);

    const sent = await worker.fetch(
      new Request("https://signup.test/", {
        method: "POST",
        headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" },
        body: JSON.stringify({ email: "reader@example.com", signup_hp: "", company: "Autofill Co" }),
      }),
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
