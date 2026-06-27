import CryptoJS from "crypto-js";
import { afterEach, describe, expect, it, vi } from "vitest";

// Store em memória p/ simular o cookieStore do next/headers (hoisted: o factory
// do vi.mock é içado acima dos imports).
const { mockStore } = vi.hoisted(() => ({
  mockStore: new Map<string, string>(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (k: string) =>
      mockStore.has(k) ? { value: mockStore.get(k) } : undefined,
    set: (k: string, v: string) => mockStore.set(k, v),
    delete: (k: string) => mockStore.delete(k),
  }),
}));

import { encryptKeyName } from "./helpersCookie";
import {
  getServerCookie,
  removeServerCookie,
  setServerCookie,
} from "./serverCookie";

afterEach(() => mockStore.clear());

/**
 * String de alta entropia (incompressível) determinística (cadeia SHA-256 em
 * base64) → após LZString + AES ultrapassa o CHUNK_SIZE e força a fragmentação.
 */
const incompressible = (len: number): string => {
  let out = "";
  let h = "seed";
  while (out.length < len) {
    h = CryptoJS.SHA256(h).toString(CryptoJS.enc.Base64);
    out += h;
  }
  return out.slice(0, len);
};

describe("serverCookie (roundtrip)", () => {
  it("set/get de objeto pequeno", async () => {
    await setServerCookie("user", { id: 1, name: "Ana" });
    expect(await getServerCookie("user")).toEqual({ id: 1, name: "Ana" });
  });

  it("set/get de string", async () => {
    await setServerCookie("token", "eyAAA.eyBBB.CCC");
    expect(await getServerCookie("token")).toBe("eyAAA.eyBBB.CCC");
  });

  it("get de chave inexistente → null", async () => {
    expect(await getServerCookie("nope")).toBeNull();
  });

  it("remove apaga o valor", async () => {
    await setServerCookie("k", { x: 1 });
    await removeServerCookie("k");
    expect(await getServerCookie("k")).toBeNull();
  });

  it("aceita expires como Date", async () => {
    await setServerCookie(
      "d",
      { y: 2 },
      { expires: new Date(Date.UTC(2030, 0, 1)) }
    );
    expect(await getServerCookie("d")).toEqual({ y: 2 });
  });

  it("valor grande é fragmentado e remontado", async () => {
    const big = { blob: incompressible(5000) };
    await setServerCookie("big", big);
    expect(await getServerCookie("big")).toEqual(big);
  });

  it("set pequeno após chunked remove os pedaços antigos", async () => {
    await setServerCookie("k", { blob: incompressible(5000) });
    await setServerCookie("k", { small: 1 });
    expect(await getServerCookie("k")).toEqual({ small: 1 });
  });

  it("remove apaga também as partes fragmentadas", async () => {
    await setServerCookie("k", { blob: incompressible(5000) });
    await removeServerCookie("k");
    expect(await getServerCookie("k")).toBeNull();
  });

  it("decodifica valores URL-encodados do cookieStore", async () => {
    // Simula um cookie cujo valor veio percent-encoded; decodeCookieValue
    // deve normalizar antes do processamento.
    await setServerCookie("u", { v: "açãõ %20" });
    expect(await getServerCookie("u")).toEqual({ v: "açãõ %20" });
  });

  it("valor com percent-encoding malformado não quebra a leitura", async () => {
    // "%" solto faz decodeURIComponent lançar; decodeCookieValue cai no catch
    // e devolve o valor cru, sem propagar a exceção.
    mockStore.set(encryptKeyName("bad"), "abc%");
    // decodeCookieValue devolve o valor cru ("abc%") em vez de propagar o erro.
    expect(await getServerCookie("bad")).toBe("abc%");
  });
});
