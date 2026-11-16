import { describe, expect, it } from "vitest";

import { DraftItem } from "./interface";
import {
  discountToAmount,
  draftTotal,
  itemSubtotal,
  mergeDraftItems,
} from "./utils";

const item = (over: Partial<DraftItem> = {}): DraftItem => ({
  productId: "p-1",
  productLabel: "Produto",
  tierId: "",
  tierLabel: "",
  unitPrice: 10,
  quantity: 1,
  discount: 0,
  discountInput: 0,
  discountType: "VALUE",
  ipiRate: 0,
  isPromo: false,
  ...over,
});

describe("itemSubtotal", () => {
  it("desconta do valor bruto", () => {
    expect(itemSubtotal(10, 3, 5)).toBe(25);
  });

  it("não deixa o item ficar negativo", () => {
    expect(itemSubtotal(10, 1, 50)).toBe(0);
  });
});

describe("draftTotal", () => {
  it("soma a mercadoria dos itens", () => {
    const total = draftTotal([
      item({ unitPrice: 10, quantity: 3 }),
      item({ productId: "p-2", unitPrice: 100, quantity: 2, discount: 40 }),
    ]);
    expect(total).toBe(190);
  });

  it("é zero sem itens", () => {
    expect(draftTotal([])).toBe(0);
  });

  it("ignora o IPI — é a mesma base que o backend guarda em total_amount", () => {
    // O piso da condição de pagamento é cobrado contra essa base, então o aviso
    // da tela só bate com o bloqueio do servidor se o IPI ficar de fora.
    const semIpi = draftTotal([item({ unitPrice: 100, quantity: 1 })]);
    const comIpi = draftTotal([
      item({ unitPrice: 100, quantity: 1, ipiRate: 10 }),
    ]);
    expect(comIpi).toBe(semIpi);
  });

  it("usa o desconto já convertido para reais", () => {
    const desconto = discountToAmount(10, "PERCENT", 100, 2);
    expect(
      draftTotal([item({ unitPrice: 100, quantity: 2, discount: desconto })])
    ).toBe(180);
  });
});

describe("mergeDraftItems", () => {
  it("põe os novos no topo e mantém os que já estavam", () => {
    const current = [item({ productId: "a" })];
    const result = mergeDraftItems(current, [item({ productId: "b" })]);
    expect(result.items.map((i) => i.productId)).toEqual(["b", "a"]);
    expect(result.added).toBe(1);
    expect(result.updated).toBe(0);
  });

  it("produto já na lista recebe a quantidade da planilha e guarda preço e desconto", () => {
    const current = [
      item({
        productId: "a",
        unitPrice: 10,
        quantity: 2,
        discountType: "PERCENT",
        discountInput: 10,
        discount: 2,
      }),
    ];
    const result = mergeDraftItems(current, [
      item({ productId: "a", unitPrice: 99, quantity: 5, discountInput: 0 }),
    ]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      unitPrice: 10,
      quantity: 5,
      discountType: "PERCENT",
      discountInput: 10,
      discount: 5,
    });
    expect(result.updated).toBe(1);
    expect(result.added).toBe(0);
  });
});
