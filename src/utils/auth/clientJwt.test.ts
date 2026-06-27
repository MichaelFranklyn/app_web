import { describe, expect, it, vi } from "vitest";

import { getCookie } from "../cookies/clientCookie";
import { getDecodedToken, parseJwt } from "./clientJwt";

vi.mock("../cookies/clientCookie", () => ({ getCookie: vi.fn() }));

const b64url = (obj: unknown) =>
  Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const makeToken = (payload: unknown) => `header.${b64url(payload)}.sig`;

describe("parseJwt", () => {
  it("decodifica o payload do token", () => {
    expect(parseJwt(makeToken({ sub: "u1", role: "ADMIN" }))).toEqual({
      sub: "u1",
      role: "ADMIN",
    });
  });

  it("retorna null p/ token malformado", () => {
    expect(parseJwt("not-a-jwt")).toBeNull();
  });

  it("retorna null no servidor (sem window)", () => {
    vi.stubGlobal("window", undefined);
    expect(parseJwt(makeToken({ sub: "x" }))).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("getDecodedToken", () => {
  it("retorna null sem cookie", () => {
    vi.mocked(getCookie).mockReturnValue(undefined);
    expect(getDecodedToken()).toBeNull();
  });

  it("decodifica o token vindo do cookie", () => {
    vi.mocked(getCookie).mockReturnValue(makeToken({ sub: "u2" }));
    expect(getDecodedToken()).toEqual({ sub: "u2" });
  });
});
