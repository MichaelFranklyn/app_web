import { describe, expect, it } from "vitest";
import { eventLabel, quotaTone, suppressionReasonLabel } from "./utils";

describe("eventLabel", () => {
  it("traduz o evento conhecido", () => {
    expect(eventLabel("delivered")).toBe("Entregue");
    expect(eventLabel("hard_bounce")).toBe("Endereço não existe");
  });
  it("devolve o evento cru quando não conhece", () => {
    expect(eventLabel("novo_evento")).toBe("novo_evento");
  });
  it("sem evento diz que ainda não houve retorno", () => {
    expect(eventLabel(null)).toBe("Sem retorno ainda");
  });
});

describe("suppressionReasonLabel", () => {
  it("explica spam", () => {
    expect(suppressionReasonLabel("spam")).toMatch(/spam/);
  });
  it("cai no texto genérico", () => {
    expect(suppressionReasonLabel("x")).toContain('"x"');
  });
});

describe("quotaTone", () => {
  it("avisa a partir de 80%", () => {
    expect(quotaTone(240, 300)).toBe("atencao");
    expect(quotaTone(239, 300)).toBe("ok");
  });
  it("cota zero não divide por zero", () => {
    expect(quotaTone(10, 0)).toBe("ok");
  });
});
