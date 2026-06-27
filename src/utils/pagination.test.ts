import { describe, expect, it } from "vitest";
import { pageToAfter } from "./pagination";

describe("pageToAfter", () => {
  it("retorna null na primeira página (sem cursor)", () => {
    expect(pageToAfter(1, 10)).toBeNull();
  });

  it("trata página 0 ou negativa como primeira página", () => {
    expect(pageToAfter(0, 10)).toBeNull();
    expect(pageToAfter(-3, 10)).toBeNull();
  });

  it("codifica o cursor Relay arrayconnection da página 2", () => {
    // (2 - 1) * 10 - 1 = 9
    expect(pageToAfter(2, 10)).toBe(btoa("arrayconnection:9"));
  });

  it("respeita o tamanho de página (first) no offset", () => {
    // (3 - 1) * 20 - 1 = 39
    expect(pageToAfter(3, 20)).toBe(btoa("arrayconnection:39"));
  });

  it("é decodificável de volta para o offset esperado", () => {
    const cursor = pageToAfter(4, 10); // (4-1)*10-1 = 29
    expect(atob(cursor!)).toBe("arrayconnection:29");
  });
});
