import { describe, expect, it } from "vitest";

import { reviewRowsToDraftItems } from "./draftItems";
import { ImportCandidate, ReviewRow } from "./interface";

const candidate = (over: Partial<ImportCandidate> = {}): ImportCandidate => ({
  rowIndex: 1,
  rawSku: "SKU-1",
  rawName: "Nome da planilha",
  quantity: "10",
  matched: true,
  productId: "p-1",
  productName: "Produto 1",
  tierId: "t-1",
  tierName: "Varejo",
  unitPrice: "10.00",
  confidence: "100",
  message: null,
  tierOptions: [
    { tierId: "t-1", tierName: "Varejo", unitPrice: "10.00" },
    { tierId: "t-2", tierName: "Atacado", unitPrice: "8.00" },
  ],
  ...over,
});

const row = (over: Partial<ReviewRow> = {}): ReviewRow => ({
  candidate: candidate(),
  include: true,
  tierId: "t-1",
  quantity: "10",
  unitPrice: "10,00",
  ipiRate: "5",
  ...over,
});

describe("reviewRowsToDraftItems", () => {
  it("vira item do rascunho com o rótulo do catálogo e origem de arquivo", () => {
    const [item] = reviewRowsToDraftItems([row()], false);
    expect(item).toMatchObject({
      productId: "p-1",
      productLabel: "SKU-1 — Produto 1",
      tierId: "t-1",
      tierLabel: "Varejo",
      unitPrice: 10,
      quantity: 10,
      discount: 0,
      ipiRate: 0, // fábrica sem IPI no pedido
      isPromo: false,
      source: "FILE_IMPORT",
    });
  });

  it("nível trocado na revisão leva o nome do nível escolhido", () => {
    const [item] = reviewRowsToDraftItems([row({ tierId: "t-2" })], false);
    expect(item.tierLabel).toBe("Atacado");
  });

  it("leva o IPI só quando a fábrica cobra no pedido", () => {
    const [item] = reviewRowsToDraftItems([row()], true);
    expect(item.ipiRate).toBe(5);
  });

  it("ignora linha desmarcada, sem produto, sem nível ou sem quantidade", () => {
    const items = reviewRowsToDraftItems(
      [
        row({ include: false }),
        row({ candidate: candidate({ productId: null }) }),
        row({ tierId: null }),
        row({ quantity: "0" }),
        row({ unitPrice: "" }),
      ],
      false
    );
    expect(items).toEqual([]);
  });

  it("desconto da ficha fica em % e vira reais pela quantidade", () => {
    const [item] = reviewRowsToDraftItems(
      [row({ discountPercent: 10 })],
      false
    );
    expect(item).toMatchObject({
      discountType: "PERCENT",
      discountInput: 10,
      discount: 10, // 10% de 10 × R$ 10
    });
  });

  it("mesmo produto duas vezes soma as quantidades num item só", () => {
    const items = reviewRowsToDraftItems(
      [
        row({ quantity: "10", discountPercent: 10 }),
        row({ quantity: "5", unitPrice: "99" }),
      ],
      false
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      quantity: 15,
      unitPrice: 10, // vale a primeira linha
      discount: 15,
    });
  });
});
