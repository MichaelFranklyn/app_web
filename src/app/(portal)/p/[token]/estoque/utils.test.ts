import { describe, expect, it } from "vitest";
import { PortalStockItem } from "../interface";
import {
  filterStock,
  itemsOfFactory,
  stockFactories,
  stockFilterCounts,
  stockPageCount,
  stockPageIds,
  stockSubmitLabel,
} from "./utils";

const item = (
  productId: string,
  daysRemaining: number | null,
  overrides: Partial<PortalStockItem> = {}
): PortalStockItem => ({
  productId,
  productName: `Produto ${productId}`,
  sku: null,
  factoryName: "Herc",
  lastPurchaseDate: null,
  estimatedStockoutDate: null,
  daysRemaining,
  lastReportedAt: null,
  ...overrides,
});

describe("filtro do estoque", () => {
  const items = [
    item("a", 0),
    item("b", 15),
    item("c", 16),
    item("d", null, { productName: "Torneira Ávila", sku: "T-9" }),
  ];

  it("conta cada faixa: acabando é até 15 dias, inclusive o que acabou", () => {
    expect(stockFilterCounts(items)).toEqual({ all: 4, low: 2, unknown: 1 });
  });

  it("recorta pela faixa", () => {
    expect(filterStock(items, "", "low").map((i) => i.productId)).toEqual([
      "a",
      "b",
    ]);
    expect(filterStock(items, "", "unknown").map((i) => i.productId)).toEqual([
      "d",
    ]);
  });

  it("busca por nome sem acento, código ou fábrica", () => {
    expect(filterStock(items, "avila", "all")).toHaveLength(1);
    expect(filterStock(items, "t-9", "all")).toHaveLength(1);
    expect(filterStock(items, "herc", "all")).toHaveLength(4);
    expect(filterStock(items, "avila", "low")).toHaveLength(0);
  });
});

describe("paginação do estoque", () => {
  const many = Array.from({ length: 23 }, (_, i) => item(String(i), i));

  it("10 por página, no mínimo uma", () => {
    expect(stockPageCount(23)).toBe(3);
    expect(stockPageCount(0)).toBe(1);
  });

  it("devolve os ids da página e prende a página ao intervalo", () => {
    expect([...stockPageIds(many, 3)]).toEqual(["20", "21", "22"]);
    expect([...stockPageIds(many, 9)]).toEqual(["20", "21", "22"]);
    expect(stockPageIds(many, 1).size).toBe(10);
  });
});

describe("texto do botão", () => {
  it("diz quantos produtos vão", () => {
    expect(stockSubmitLabel(0)).toBe("Enviar para o meu representante");
    expect(stockSubmitLabel(1)).toBe(
      "Enviar 1 produto para o meu representante"
    );
    expect(stockSubmitLabel(3)).toBe(
      "Enviar 3 produtos para o meu representante"
    );
  });
});

describe("fábricas do estoque", () => {
  const item = (productId: string, factoryName: string) =>
    ({
      productId,
      productName: productId,
      sku: null,
      factoryName,
      lastPurchaseDate: null,
      estimatedStockoutDate: null,
      daysRemaining: null,
      lastReportedAt: null,
    }) satisfies PortalStockItem;
  const lista = [item("a", "HERC"), item("b", "ASSA"), item("c", "HERC")];

  it("lista as fábricas na ordem da urgência, sem repetir", () => {
    expect(stockFactories(lista)).toEqual(["HERC", "ASSA"]);
  });

  it("recorta os produtos da fábrica escolhida", () => {
    expect(itemsOfFactory(lista, "HERC").map((i) => i.productId)).toEqual([
      "a",
      "c",
    ]);
    expect(itemsOfFactory(lista, null)).toHaveLength(3);
  });
});
