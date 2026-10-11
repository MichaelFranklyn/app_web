import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

vi.mock("@/utils/cookies/serverCookie", () => ({
  getServerCookie: vi.fn(async (name: string) =>
    name === "token" ? "jwt-do-cookie" : undefined
  ),
}));

const request = (body: unknown) =>
  new NextRequest("http://localhost/api/graphql", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("BFF /api/graphql", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("repassa a resposta e o status do backend, com o token do cookie", async () => {
    fetchMock.mockResolvedValue(
      new Response('{"data":{"ok":true}}', { status: 200 })
    );

    const res = await POST(request({ operationName: "Ping", query: "{ok}" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { ok: true } });
    const [uri, init] = fetchMock.mock.calls[0];
    expect(uri).toContain("?op=Ping");
    expect(init.headers.Authorization).toBe("Bearer jwt-do-cookie");
  });

  it("recusa do backend continua sendo recusa (o status não é reescrito)", async () => {
    fetchMock.mockResolvedValue(
      new Response('{"errors":[{"message":"não pode"}]}', { status: 403 })
    );

    const res = await POST(request({ query: "{x}" }));

    expect(res.status).toBe(403);
  });

  it("backend fora do ar vira 503, não 500 — a fila offline espera em vez de descartar", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const res = await POST(request({ query: "{x}" }));

    expect(res.status).toBe(503);
    expect((await res.json()).errors[0].extensions.code).toBe(503);
  });

  it("backend que não responde a tempo vira 504", async () => {
    fetchMock.mockRejectedValue(new DOMException("timeout", "TimeoutError"));

    const res = await POST(request({ query: "{x}" }));

    expect(res.status).toBe(504);
  });

  it("conexão cortada no meio da resposta também é 503", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      text: () => Promise.reject(new TypeError("terminated")),
    });

    const res = await POST(request({ query: "{x}" }));

    expect(res.status).toBe(503);
  });
});
