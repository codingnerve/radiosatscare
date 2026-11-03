import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DUPLICATE_WINDOW_MS } from "../server/services/enquiry.service";
import { buildApp, validEnquiry } from "./helpers";
import request from "./http";

describe("POST /api/enquiries validation", () => {
  it("returns field messages for an empty body and sends nothing", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app).post("/api/enquiries").send({});
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const fields = res.body.error.fields as Record<string, string>;
    expect(fields.fullName).toBeTruthy();
    expect(fields.email).toBeTruthy();
    expect(fields.phone).toBeTruthy();
    expect(fields.issueCategory).toBeTruthy();
    expect(fields.message).toBeTruthy();
    expect(fields.preferredContact).toBeTruthy();
    expect(fields.consent).toMatch(/privacy/i);
    expect(fields.submissionId).toBeTruthy();
    expect(mailer.sent).toHaveLength(0);
  });

  it.each([
    ["email", { email: "not-an-email" }, "Enter a valid email address"],
    ["phone", { phone: "abc" }, undefined],
    ["phone", { phone: "12-34" }, "Phone number must be 7 to 20 characters"],
    ["phone", { phone: "555 0100 ext 9" }, "Phone number can only contain digits, spaces and + - ( )"],
    ["message", { message: "too short" }, "Please describe the problem in at least 10 characters"],
    ["message", { message: "x".repeat(2001) }, "Description must be 2000 characters or fewer"],
    ["message", { message: "see http://a.test http://b.test http://c.test for details" }, "Please include no more than 2 links"],
    ["issueCategory", { issueCategory: "billing" }, "Choose an issue category"],
    ["preferredContact", { preferredContact: "fax" }, "Choose how you would like to be contacted"],
    ["consent", { consent: false }, "You must agree to the privacy notice to send your enquiry"],
    ["submissionId", { submissionId: "123" }, "Invalid submission id"],
    ["vehicle", { vehicle: "x".repeat(121) }, "Vehicle must be 120 characters or fewer"],
  ])("rejects a bad %s", async (field, override, expected) => {
    const { app } = buildApp();
    const res = await request(app).post("/api/enquiries").send(validEnquiry(override));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const message = (res.body.error.fields as Record<string, string>)[field];
    expect(message).toBeTruthy();
    if (expected) expect(message).toBe(expected);
  });

  it("does not accept operator objects or arrays as values", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry({ email: { $ne: "" }, fullName: ["a", "b"] }));
    expect(res.status).toBe(400);
    expect(mailer.sent).toHaveLength(0);
  });

  it("rejects control characters in single-line fields (header injection)", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry({ fullName: "Alex\r\nBcc: attacker@example.test" }));
    expect(res.status).toBe(400);
    expect(mailer.sent).toHaveLength(0);
  });
});

describe("POST /api/enquiries success", () => {
  it("emails the business with a reference and normalised details", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app).post("/api/enquiries").send(validEnquiry());

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.reference).toMatch(/^RSC-[2-9A-HJKMNP-Z]{6}$/);

    expect(mailer.sent).toHaveLength(1);
    const mail = mailer.sent[0];
    expect(mail?.to).toEqual(["business@example.test"]);
    expect(mail?.subject).toContain(res.body.reference);
    expect(mail?.text).toContain("Alex Driver");
    expect(mail?.text).toContain("alex@example.test"); // lower-cased
    expect(mail?.text).toContain("2021 Example Estate");
    expect(mail?.text).not.toContain("Radio / provider"); // blank optional field left out
    expect(mail?.replyTo).toEqual({ email: "alex@example.test", name: "Alex Driver" });
  });

  it("never includes the visitor's IP address in the email", async () => {
    const { app, mailer } = buildApp({ TRUST_PROXY: "1" });
    await request(app).post("/api/enquiries").set("X-Forwarded-For", "203.0.113.77").send(validEnquiry());
    const mail = mailer.sent[0];
    expect(`${mail?.html}${mail?.text}${mail?.subject}`).not.toContain("203.0.113.77");
  });

  it("escapes visitor-supplied text in the email", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry({ fullName: "Eve <script>alert(1)</script>", message: "Hello <img src=x onerror=alert(1)> there, please help me" }));
    expect(res.status).toBe(201);
    const mail = mailer.sent[0];
    expect(mail?.html).not.toContain("<script>");
    expect(mail?.html).not.toContain("<img");
    expect(mail?.html).toContain("&lt;script&gt;");
    expect(mail?.html).toContain("&lt;img src=x");
    expect(mail?.subject).not.toContain("script");
  });

  it("tells the visitor when the email cannot be sent, because there is no other copy", async () => {
    const { app, mailer } = buildApp();
    mailer.failWith = new Error("SMTP exploded for secret@example.test");
    const res = await request(app).post("/api/enquiries").send(validEnquiry());
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("SEND_FAILED");
    expect(res.body.error.message).toMatch(/try again|call us/i);
    expect(JSON.stringify(res.body)).not.toMatch(/SMTP|secret@example/);
  });

  it("really sends on a retry after a failure (failures are not remembered as duplicates)", async () => {
    const { app, mailer } = buildApp();
    const body = validEnquiry();
    mailer.failWith = new Error("temporary outage");
    expect((await request(app).post("/api/enquiries").send(body)).status).toBe(502);

    mailer.failWith = undefined;
    const retry = await request(app).post("/api/enquiries").send(body);
    expect(retry.status).toBe(201);
    expect(retry.body.duplicate).toBeUndefined();
    expect(mailer.sent).toHaveLength(1);
  });
});

describe("duplicate and spam protection", () => {
  it("returns the original reference for a repeated submissionId", async () => {
    const { app, mailer } = buildApp();
    const body = validEnquiry();
    const first = await request(app).post("/api/enquiries").send(body);
    const second = await request(app).post("/api/enquiries").send(body);
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body).toEqual({ ok: true, reference: first.body.reference, duplicate: true });
    expect(mailer.sent).toHaveLength(1);
  });

  it("treats concurrent submissions with the same id as one enquiry", async () => {
    const { app, mailer } = buildApp();
    const body = validEnquiry();
    const results = await Promise.all([1, 2, 3].map(() => request(app).post("/api/enquiries").send(body)));
    expect(results.every((r) => r.status === 200 || r.status === 201)).toBe(true);
    expect(new Set(results.map((r) => r.body.reference)).size).toBe(1);
    expect(mailer.sent).toHaveLength(1);
  });

  describe("identical content within the duplicate window", () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
    afterEach(() => vi.useRealTimers());

    it("is a duplicate for 10 minutes, then a fresh enquiry", async () => {
      const { app, mailer } = buildApp();
      const first = await request(app).post("/api/enquiries").send(validEnquiry({ startedAt: Date.now() - 10_000 }));
      const second = await request(app)
        .post("/api/enquiries")
        .send(validEnquiry({ submissionId: randomUUID(), startedAt: Date.now() - 10_000 }));
      expect(second.status).toBe(200);
      expect(second.body.duplicate).toBe(true);
      expect(second.body.reference).toBe(first.body.reference);
      expect(mailer.sent).toHaveLength(1);

      vi.setSystemTime(Date.now() + DUPLICATE_WINDOW_MS + 1000);
      const third = await request(app)
        .post("/api/enquiries")
        .send(validEnquiry({ submissionId: randomUUID(), startedAt: Date.now() - 10_000 }));
      expect(third.status).toBe(201);
      expect(mailer.sent).toHaveLength(2);
    });
  });

  it("silently accepts but discards honeypot submissions", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app).post("/api/enquiries").send(validEnquiry({ website: "https://spam.example" }));
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.reference).toMatch(/^RSC-/);
    expect(mailer.sent).toHaveLength(0);
  });

  it("discards a honeypot hit even when the rest of the body is invalid", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app).post("/api/enquiries").send({ website: "x", email: "nope" });
    expect(res.status).toBe(201);
    expect(mailer.sent).toHaveLength(0);
  });

  it("rejects a form submitted faster than 2 seconds with TOO_FAST", async () => {
    const { app, mailer } = buildApp();
    const res = await request(app).post("/api/enquiries").send(validEnquiry({ startedAt: Date.now() - 300 }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("TOO_FAST");
    expect(res.body.error.message).toBe("Please take a moment to review your message and send it again.");
    expect(mailer.sent).toHaveLength(0);

    const ok = await request(app).post("/api/enquiries").send(validEnquiry({ startedAt: Date.now() - 2500 }));
    expect(ok.status).toBe(201);
  });

  it("rate limits per IP with a 429 in the contract shape", async () => {
    const { app, mailer } = buildApp({ RATE_LIMIT_ENQUIRY_MAX: "2" });
    const send = (n: number) =>
      request(app)
        .post("/api/enquiries")
        .send(validEnquiry({ message: `Distinct message number ${n} about my radio.` }));
    expect((await send(1)).status).toBe(201);
    expect((await send(2)).status).toBe(201);
    const limited = await send(3);
    expect(limited.status).toBe(429);
    expect(limited.body.ok).toBe(false);
    expect(limited.body.error.code).toBe("RATE_LIMITED");
    expect(limited.headers["ratelimit"] ?? limited.headers["ratelimit-policy"]).toBeDefined();
    expect(mailer.sent).toHaveLength(2);
  });

  it("does not count validation failures against a visitor's allowance", async () => {
    const { app } = buildApp({ RATE_LIMIT_ENQUIRY_MAX: "2" });
    for (let i = 0; i < 4; i++) {
      const bad = await request(app).post("/api/enquiries").send(validEnquiry({ email: "bad" }));
      expect(bad.status).toBe(400);
    }
    const good = await request(app).post("/api/enquiries").send(validEnquiry());
    expect(good.status).toBe(201);
  });

  it("does not count a failed email send against the allowance either", async () => {
    const { app, mailer } = buildApp({ RATE_LIMIT_ENQUIRY_MAX: "2" });
    mailer.failWith = new Error("down");
    for (let i = 0; i < 3; i++) {
      expect((await request(app).post("/api/enquiries").send(validEnquiry({ submissionId: randomUUID() }))).status).toBe(502);
    }
    mailer.failWith = undefined;
    expect((await request(app).post("/api/enquiries").send(validEnquiry())).status).toBe(201);
  });
});
