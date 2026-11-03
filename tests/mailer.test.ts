import { afterEach, describe, expect, it, vi } from "vitest";
import { createMailer } from "../server/services/mailer";
import { createLogger } from "../server/utils/logger";
import { testEnv } from "./helpers";

const message = {
  to: ["owner@example.test", "second@example.test"],
  subject: "New enquiry RSC-ABC234: Signal and reception",
  html: "<p>Hello</p>",
  text: "Hello",
  replyTo: { email: "visitor@example.test", name: "Visitor" },
};

afterEach(() => vi.unstubAllGlobals());

describe("brevo mailer", () => {
  const env = () => testEnv({ EMAIL_PROVIDER: "brevo", BREVO_API_KEY: "test-api-key", EMAIL_FROM: "sender@example.test", EMAIL_FROM_NAME: "RadioSatCare" });

  it("posts the documented payload to the Brevo transactional API with the key in a header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await createMailer(env(), createLogger("silent")).send(message);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["api-key"]).toBe("test-api-key");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      sender: { name: "RadioSatCare", email: "sender@example.test" },
      to: [{ email: "owner@example.test" }, { email: "second@example.test" }],
      replyTo: { email: "visitor@example.test", name: "Visitor" },
      subject: message.subject,
      htmlContent: "<p>Hello</p>",
      textContent: "Hello",
    });
    // The key must never travel in the body or URL.
    expect(JSON.stringify(body)).not.toContain("test-api-key");
    expect(url).not.toContain("test-api-key");
  });

  it("throws on a non-2xx answer without including the response body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"message":"bad recipient owner@example.test"}', { status: 400 })));
    const err = await createMailer(env(), createLogger("silent")).send(message).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("Brevo API responded with status 400");
    expect((err as Error).message).not.toContain("owner@example.test");
  });

  it("propagates network failures so the caller can record them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(createMailer(env(), createLogger("silent")).send(message)).rejects.toThrow("fetch failed");
  });
});

describe("log mailer", () => {
  it("never writes message content or recipients to the log", async () => {
    const lines: string[] = [];
    const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      lines.push(String(chunk));
      return true;
    });
    try {
      await createMailer(testEnv({ EMAIL_PROVIDER: "log" }), createLogger("info")).send(message);
    } finally {
      spy.mockRestore();
    }
    const out = lines.join("");
    expect(out).toContain("recipientCount");
    expect(out).not.toMatch(/owner@example|visitor@example|Hello/);
  });
});
