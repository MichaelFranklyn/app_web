import CryptoJS from "crypto-js";
import { afterEach, describe, expect, it } from "vitest";

import { getCookie, removeCookie, setCookie } from "./clientCookie";

/**
 * Gera uma string de alta entropia (incompressível) de forma determinística:
 * cadeia de SHA-256 em base64. Necessário para que após LZString + AES o valor
 * ultrapasse o CHUNK_SIZE (2000) e force o caminho de fragmentação — texto
 * repetitivo (ex.: "A".repeat) comprime e nunca exercita os chunks.
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

afterEach(() => {
  // Expira todos os cookies do jsdom entre os testes.
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name)
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
});

describe("clientCookie (roundtrip)", () => {
  it("set/get de objeto pequeno", () => {
    setCookie("user", { id: 1, name: "Ana" });
    expect(getCookie("user")).toEqual({ id: 1, name: "Ana" });
  });

  it("set/get de string (JWT-like)", () => {
    setCookie("token", "eyAAA.eyBBB.CCC");
    expect(getCookie("token")).toBe("eyAAA.eyBBB.CCC");
  });

  it("getCookie de chave inexistente → null", () => {
    expect(getCookie("nope")).toBeNull();
  });

  it("removeCookie apaga o valor", () => {
    setCookie("k", { x: 1 });
    removeCookie("k");
    expect(getCookie("k")).toBeNull();
  });

  it("valor grande é fragmentado em chunks e remontado", () => {
    const big = { blob: incompressible(5000) };
    setCookie("big", big);
    expect(getCookie("big")).toEqual(big);
  });

  it("set pequeno após um chunked remove os pedaços antigos", () => {
    setCookie("k", { blob: incompressible(5000) });
    setCookie("k", { small: 1 });
    expect(getCookie("k")).toEqual({ small: 1 });
  });

  it("removeCookie apaga também as partes fragmentadas", () => {
    setCookie("k", { blob: incompressible(5000) });
    removeCookie("k");
    expect(getCookie("k")).toBeNull();
  });
});
