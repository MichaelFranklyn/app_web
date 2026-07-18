import { describe, expect, it } from "vitest";

import { PromotionItemNode } from "./interface";
import {
  buildPromotionItems,
  countPromotedItems,
  groupItemsByProduct,
  parsePromoInputs,
  seedPromoByItem,
} from "./utils";

const node = (
  id: string,
  productId: string,
  tierId: string,
  unitPrice: string,
  promoPrice: string | null = null
): PromotionItemNode => ({
  id,
  unitPrice,
  promoPrice,
  product: {
    id: productId,
    name: `Produto ${productId}`,
    sku: productId,
    unitPerPack: "1",
  },
  tier: { id: tierId, name: `Nível ${tierId}` },
});

describe("groupItemsByProduct", () => {
  it("agrupa níveis sob o mesmo produto (preço é por nível)", () => {
    const groups = groupItemsByProduct([
      node("1", "A", "bronze", "10.00"),
      node("2", "A", "ouro", "14.00"),
      node("3", "B", "bronze", "5.00"),
    ]);
    expect(groups).toHaveLength(2);
    const a = groups.find((g) => g.id === "A")!;
    expect(a.items).toHaveLength(2);
  });

  it("ignora itens sem produto ou sem nível", () => {
    const orphan: PromotionItemNode = {
      id: "x",
      unitPrice: "1",
      promoPrice: null,
      product: null,
      tier: null,
    };
    expect(groupItemsByProduct([orphan])).toHaveLength(0);
  });

  it("deduplica itens repetidos (varredura por cursor pode repetir)", () => {
    const groups = groupItemsByProduct([
      node("1", "A", "bronze", "10.00"),
      node("1", "A", "bronze", "10.00"),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
  });
});

describe("seedPromoByItem", () => {
  it("semeia só itens com promoPrice, mascarado como moeda, por item.id", () => {
    const seed = seedPromoByItem([
      node("1", "A", "bronze", "10.00", "7.50"),
      node("2", "A", "ouro", "14.00", null),
    ]);
    expect(seed).toEqual({ "1": "7,50" });
  });
});

describe("parsePromoInputs", () => {
  it("converte máscara em número e descarta vazios/não positivos", () => {
    expect(
      parsePromoInputs({ "1": "7,50", "2": "", "3": "0,00", "4": "1.234,00" })
    ).toEqual({ "1": 7.5, "4": 1234 });
  });
});

describe("buildPromotionItems", () => {
  const nodes = [
    node("1", "A", "bronze", "10.00"),
    node("2", "A", "ouro", "14.00"),
    node("3", "B", "bronze", "5.00"),
  ];

  it("gera uma entrada por (produto, nível) com preço válido", () => {
    const items = buildPromotionItems(nodes, { "1": 8, "2": 11 });
    expect(items).toEqual([
      { productId: "A", tierId: "bronze", promoPrice: 8 },
      { productId: "A", tierId: "ouro", promoPrice: 11 },
    ]);
  });

  it("permite preços diferentes por nível do mesmo produto", () => {
    const items = buildPromotionItems(nodes, { "1": 8, "2": 12.5 });
    expect(items.map((i) => i.promoPrice)).toEqual([8, 12.5]);
  });

  it("ignora itens sem preço", () => {
    expect(buildPromotionItems(nodes, {})).toEqual([]);
  });

  it("não duplica quando o mesmo item vem repetido", () => {
    const dup = [
      node("1", "A", "bronze", "10.00"),
      node("1", "A", "bronze", "10.00"),
    ];
    expect(buildPromotionItems(dup, { "1": 8 })).toEqual([
      { productId: "A", tierId: "bronze", promoPrice: 8 },
    ]);
  });
});

describe("countPromotedItems", () => {
  it("conta os itens com preço promocional válido", () => {
    expect(countPromotedItems({ "1": 8, "2": 4 })).toBe(2);
    expect(countPromotedItems({})).toBe(0);
  });
});
