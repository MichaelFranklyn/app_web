import { describe, expect, it } from "vitest";

import { pickFreeFreight } from "./useFreeFreightTarget";

// A fábrica entrega de graça acima de R$ 5.000.
const AMOUNTS = { freeFreightCifAmount: 5000 };

describe("pickFreeFreight", () => {
  it("aponta o piso num pedido CIF", () => {
    expect(pickFreeFreight(AMOUNTS, "CIF")).toEqual({
      freightType: "CIF",
      amount: 5000,
    });
  });

  // A regra do domínio: frete grátis é a fábrica isentando a ENTREGA. Em FOB o
  // cliente contrata o transporte, então não há frete da fábrica a isentar —
  // perseguir um valor ali seria acrescentar itens por um benefício que não vem.
  it("não existe alvo em pedido FOB", () => {
    expect(pickFreeFreight(AMOUNTS, "FOB")).toBeNull();
  });

  it("aceita o valor em minúsculas", () => {
    expect(pickFreeFreight(AMOUNTS, "cif")?.freightType).toBe("CIF");
  });

  // Enquanto o frete não foi escolhido não há alvo: o pedido ainda pode virar
  // FOB, e o aviso teria de desaparecer.
  it("sem modalidade não há alvo", () => {
    expect(pickFreeFreight(AMOUNTS, null)).toBeNull();
    expect(pickFreeFreight(AMOUNTS, "")).toBeNull();
  });

  it("fábrica que não oferece frete grátis", () => {
    expect(pickFreeFreight({ freeFreightCifAmount: null }, "CIF")).toBeNull();
  });

  it("zero é o mesmo que não oferecer", () => {
    expect(pickFreeFreight({ freeFreightCifAmount: 0 }, "CIF")).toBeNull();
  });

  it("sem vínculo carregado ainda, nada a mostrar", () => {
    expect(pickFreeFreight(null, "CIF")).toBeNull();
  });
});
