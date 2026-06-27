import LZString from "lz-string";
import { describe, expect, it } from "vitest";

import {
  decryptValue,
  encryptKeyName,
  encryptValue,
  parseJSON,
  processEncryptedCookieValue,
  removeTypename,
} from "./helpersCookie";

describe("encryptKeyName", () => {
  it("é determinístico e ofusca o nome cru", () => {
    expect(encryptKeyName("token")).toBe(encryptKeyName("token"));
    expect(encryptKeyName("token")).not.toBe("token");
    expect(encryptKeyName("a")).not.toBe(encryptKeyName("b"));
  });
});

describe("encryptValue / decryptValue", () => {
  it("faz roundtrip do valor", () => {
    const enc = encryptValue("hello");
    expect(enc).not.toBe("hello");
    expect(decryptValue(enc)).toBe("hello");
  });

  it("decrypt de texto não cifrado retorna vazio", () => {
    expect(decryptValue("não-cifrado")).toBe("");
  });

  it("decrypt de ciphertext inválido retorna vazio", () => {
    expect(decryptValue("garbagebase64notvalid")).toBe("");
  });
});

describe("processEncryptedCookieValue", () => {
  it("decifra + descomprime + parseia um objeto", () => {
    const obj = { a: 1, b: "x" };
    const payload = encryptValue(
      LZString.compressToEncodedURIComponent(JSON.stringify(obj))
    );
    expect(processEncryptedCookieValue(payload)).toEqual(obj);
  });

  it("fallback: valor comprimido mas não cifrado é descomprimido + parseado", () => {
    // decryptValue retorna "" (não está cifrado) → cai no ramo de fallback que
    // tenta descomprimir e parsear o valor cru.
    const obj = { only: "compressed" };
    const payload = LZString.compressToEncodedURIComponent(JSON.stringify(obj));
    expect(processEncryptedCookieValue(payload)).toEqual(obj);
  });

  it("fallback: string crua não-cifrada é retornada como está", () => {
    // Não cifrado e não comprimível → finalString === valor cru.
    expect(processEncryptedCookieValue("texto-cru")).toBe("texto-cru");
  });
});

describe("parseJSON", () => {
  it("parseia objeto JSON", () => {
    expect(parseJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it("retorna o JWT como string (sem tentar parse)", () => {
    const jwt = "eyAAA.eyBBB.CCC";
    expect(parseJSON(jwt)).toBe(jwt);
  });

  it("desfaz JSON duplo-encodado", () => {
    expect(parseJSON(JSON.stringify(JSON.stringify({ a: 1 })))).toEqual({
      a: 1,
    });
  });

  it("retorna a string interna quando o duplo-parse falha", () => {
    // JSON.parse('"hello"') = "hello" (string) → JSON.parse("hello") lança →
    // retorna a própria string desencapada.
    expect(parseJSON('"hello"')).toBe("hello");
  });

  it("retorna null p/ JSON inválido", () => {
    expect(parseJSON("{")).toBeNull();
  });
});

describe("removeTypename", () => {
  it("remove __typename recursivamente (objeto/lista)", () => {
    const input = {
      __typename: "X",
      a: 1,
      child: { __typename: "Y", b: 2 },
      list: [{ __typename: "Z", c: 3 }],
    };
    expect(removeTypename(input)).toEqual({
      a: 1,
      child: { b: 2 },
      list: [{ c: 3 }],
    });
  });

  it("passa primitivos/null sem alterar", () => {
    expect(removeTypename(5)).toBe(5);
    expect(removeTypename(null)).toBeNull();
  });
});
