import { describe, expect, it, vi } from "vitest";
import { loadEnv } from "../server/config/env";
import { createApi } from "../server/http/api";
import { createLogger, redact, scrubString } from "../server/utils/logger";
import { RecordingMailer, TEST_ORIGIN, buildApp, testEnv, validEnquiry } from "./helpers";
import request from "./http";

describe("security headers and hardening", () => {
  it("sends security headers, hides the framework, and disables caching on /api", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["referrer-policy"]).toBeDefined();
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("allows a configured origin and gives unknown origins no CORS headers", async () => {
    const { app } = buildApp();
    const allowed = await request(app).get("/api/health").set("Origin", TEST_ORIGIN);
    expect(allowed.headers["access-control-allow-origin"]).toBe(TEST_ORIGIN);
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

    const unknown = await request(app).get("/api/health").set("Origin", "https://evil.example");
    expect(unknown.headers["access-control-allow-origin"]).toBeUndefined();

    const preflight = await request(app)
      .options("/api/enquiries")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "POST");
    expect(preflight.headers["access-control-allow-origin"]).toBeUndefined();

    const goodPreflight = await request(app)
      .options("/api/enquiries")
      .set("Origin", TEST_ORIGIN)
      .set("Access-Control-Request-Method", "POST");
    expect(goodPreflight.headers["access-control-allow-origin"]).toBe(TEST_ORIGIN);
  });

  it("refuses state-changing requests from an unknown origin without sending anything", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app).post("/api/enquiries").set("Origin", "https://evil.example").send(validEnquiry());
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
    expect(mailer.sent).toHaveLength(0);

    const fromSite = await request(app).post("/api/enquiries").set("Origin", TEST_ORIGIN).send(validEnquiry());
    expect(fromSite.status).toBe(201);
  });

  it("accepts a browser request whose Origin matches the host it was sent to, without any configuration", async () => {
    const { app } = buildApp();
    // The test requests go to http://localhost, so Origin http://localhost is this site talking to itself.
    const same = await request(app).post("/api/enquiries").set("Origin", "http://localhost").send(validEnquiry());
    expect(same.status).toBe(201);

    // A different port or host is a different origin and must still be refused.
    const otherPort = await request(app).post("/api/enquiries").set("Origin", "http://localhost:9999").send(validEnquiry());
    expect(otherPort.status).toBe(403);
    const foreign = await request(app).post("/api/enquiries").set("Origin", "https://evil.example").send(validEnquiry());
    expect(foreign.status).toBe(403);
  });

  it("returns a JSON 404 in the contract shape, and no admin or login routes exist", async () => {
    const { app } = buildApp();
    for (const path of ["/api/nope", "/api/admin/auth/login", "/api/admin/enquiries"]) {
      const res = await request(app).get(path);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } });
    }
    const login = await request(app).post("/api/admin/auth/login").send({ email: "a@b.test", password: "x" });
    expect(login.status).toBe(404);
  });

  it("returns 400 for malformed JSON and oversized bodies", async () => {
    const { app } = buildApp();
    const malformed = await request(app).post("/api/enquiries").set("Content-Type", "application/json").send("{not json");
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe("VALIDATION_ERROR");
    expect(JSON.stringify(malformed.body)).not.toMatch(/SyntaxError|at \w+ \(/);

    const huge = await request(app).post("/api/enquiries").send({ message: "x".repeat(50_000) });
    expect(huge.status).toBe(400);
    expect(huge.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("never leaks internals or stack traces on an unexpected error", async () => {
    const app = createApi({
      env: testEnv(),
      mailer: new RecordingMailer(),
      connect: async () => {
        throw new Error("kaboom at C:\\secret\\path\\db.ts postgres://user:pw@host");
      },
    });
    const res = await request(app).post("/api/enquiries").send(validEnquiry());
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong on our side. Please try again." },
    });
    const text = JSON.stringify(res.body);
    expect(text).not.toMatch(/kaboom|secret|stack|postgres|\.ts/i);
  });

  it("rate limits all /api traffic with the global limiter", async () => {
    const { app } = buildApp({ RATE_LIMIT_GLOBAL_MAX: "3" });
    for (let i = 0; i < 3; i++) expect((await request(app).get("/api/health")).status).toBe(200);
    const limited = await request(app).get("/api/health");
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe("RATE_LIMITED");
  });
});

describe("safe logging", () => {
  it("redacts sensitive keys and masks emails and credentials in strings", () => {
    const out = redact({
      email: "a@b.test",
      phone: "+1 555 0100",
      password: "hunter2",
      headers: { authorization: "Bearer abc", cookie: "session=xyz" },
      note: "contact me at someone@example.test or mongodb://user:secret@host/db",
      status: 201,
    }) as Record<string, unknown>;
    const text = JSON.stringify(out);
    expect(out.email).toBe("[redacted]");
    expect(out.phone).toBe("[redacted]");
    expect(out.password).toBe("[redacted]");
    expect(text).not.toMatch(/hunter2|Bearer abc|session=xyz|someone@example|user:secret/);
    expect(text).toContain("[redacted-email]");
    expect(out.status).toBe(201);
    expect(scrubString("x mongodb+srv://u:p@c.mongodb.net/db y")).toBe("x mongodb://[redacted] y");
  });

  it("does not write request bodies or visitor details to the log", async () => {
    const lines: string[] = [];
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      lines.push(String(chunk));
      return true;
    });
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      lines.push(String(chunk));
      return true;
    });
    try {
      const env = loadEnv({
        NODE_ENV: "test",
        BUSINESS_EMAIL: "business@example.test",
        EMAIL_FROM: "no-reply@example.test",
        LOG_LEVEL: "debug",
      });
      const app = createApi({ env, mailer: new RecordingMailer(), logger: createLogger("debug") });
      await request(app)
        .post("/api/enquiries")
        .send(validEnquiry({ fullName: "Distinctive Visitor Name", message: "Distinctive private message text here", phone: "+1 555 010 0177" }));
    } finally {
      stdout.mockRestore();
      stderr.mockRestore();
    }
    const log = lines.join("");
    expect(log).toContain('"msg":"request"');
    expect(log).toContain('"path":"/api/enquiries"');
    expect(log).not.toMatch(/Distinctive|alex@example|555 010 0177/i);
  });
});
