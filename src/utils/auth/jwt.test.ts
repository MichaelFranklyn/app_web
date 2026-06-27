import { describe, expect, it, vi } from "vitest";

import { getServerCookie } from "../cookies/serverCookie";
import { getDecodedTokenServer, parseJwtServer } from "./jwt";

vi.mock("../cookies/serverCookie", () => ({ getServerCookie: vi.fn() }));

const b64url = (obj: unknown) =>
  Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const makeToken = (payload: unknown) => `header.${b64url(payload)}.sig`;

describe("parseJwtServer", () => {
  it("decodifica o payload", () => {
    expect(parseJwtServer(makeToken({ sub: "s1" }))).toEqual({ sub: "s1" });
  });

  it("retorna null p/ token inválido", () => {
    expect(parseJwtServer("nope")).toBeNull();
  });
});

describe("getDecodedTokenServer", () => {
  it("retorna null sem cookie", async () => {
    vi.mocked(getServerCookie).mockResolvedValue(null);
    expect(await getDecodedTokenServer()).toBeNull();
  });

  it("decodifica o token do cookie", async () => {
    vi.mocked(getServerCookie).mockResolvedValue(makeToken({ sub: "x" }));
    expect(await getDecodedTokenServer()).toEqual({ sub: "x" });
  });
});
