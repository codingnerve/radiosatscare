import type { ApiHandler } from "../server/http/api";

export interface TestResponse {
  status: number;
  /** Parsed JSON, or the raw text when the response is not JSON (or `.asText()` was used). */
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- test convenience, mirrors supertest
  text: string;
  /** Lower-cased header names. `set-cookie` is an array. */
  headers: Record<string, string | string[] | undefined>;
}

/**
 * A tiny stand-in for supertest: it calls the API handler directly with a Web `Request`, so tests
 * exercise exactly the code path Next.js uses, without opening a socket.
 */
export class TestRequest implements PromiseLike<TestResponse> {
  private readonly headers = new Headers();
  private payload: unknown;
  private textBody = false;

  constructor(
    private readonly handler: ApiHandler,
    private readonly method: string,
    private readonly path: string,
  ) {}

  set(name: string | Record<string, string>, value?: string): this {
    if (typeof name === "string") this.headers.set(name, value ?? "");
    else for (const [k, v] of Object.entries(name)) this.headers.set(k, v);
    return this;
  }

  send(data: unknown): this {
    this.payload = data;
    return this;
  }

  /** Return the response body as text instead of parsing it as JSON. */
  asText(): this {
    this.textBody = true;
    return this;
  }

  private async run(): Promise<TestResponse> {
    const init: RequestInit = { method: this.method, headers: this.headers };
    if (this.payload !== undefined) {
      if (typeof this.payload === "string") {
        init.body = this.payload;
      } else {
        init.body = JSON.stringify(this.payload);
        if (!this.headers.has("content-type")) this.headers.set("content-type", "application/json");
      }
    }
    const response = await this.handler(new Request(`http://localhost${this.path}`, init));
    const text = await response.text();

    const headers: TestResponse["headers"] = {};
    response.headers.forEach((value, name) => {
      if (name !== "set-cookie") headers[name] = value;
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) headers["set-cookie"] = cookies;

    let body: unknown = text;
    if (!this.textBody && (response.headers.get("content-type") ?? "").includes("json")) {
      body = text === "" ? {} : JSON.parse(text);
    }
    return { status: response.status, body, text, headers };
  }

  then<R1 = TestResponse, R2 = never>(
    onfulfilled?: ((value: TestResponse) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export default function request(handler: ApiHandler) {
  const make = (method: string) => (path: string) => new TestRequest(handler, method, path);
  return {
    get: make("GET"),
    post: make("POST"),
    patch: make("PATCH"),
    put: make("PUT"),
    delete: make("DELETE"),
    options: make("OPTIONS"),
  };
}
