import { describe, expect, it } from "vitest";

import { PurchaseRow } from "./interface";
import { PURCHASES_PDF_COLUMNS } from "./pdfColumns";
import { PURCHASE_FILTER_FIELDS } from "./usePurchaseFilters";
import {
  buildPurchasesExportRows,
  cadenceLabel,
  factoryOptions,
  idleLabel,
  lastPurchaseLabel,
  orderNumber,
  PURCHASES_EXPORT_HEADERS,
  PURCHASE_SORT_COLUMNS,
  PURCHASE_SORT_LABELS,
  rowHref,
  summarize,
} from "./utils";

const row = (overrides: Partial<PurchaseRow> = {}): PurchaseRow => ({
  clientId: "c1",
  companyClientId: "cc1",
  clientName: "Mercado Bom Preço",
  city: "Salvador",
  state: "BA",
  factoryId: "f1",
  factoryName: "HERC",
  sellerName: "Ana",
  isLinked: true,
  situation: "ACTIVE",
  lastOrderId: "abcdef12-3456-7890-abcd-ef1234567890",
  lastOrderDate: "2026-07-30",
  lastOrderAmount: "5389.31",
  lastOrderStatus: "CONFIRMED",
  lastInvoicedAt: null,
  daysSinceLastOrder: 7,
  avgIntervalDays: 30,
  riskRatio: 0.23,
  orderCount: 4,
  historyAmount: "20000",
  periodOrderCount: 1,
  periodAmount: "5389.31",
  ...overrides,
});

describe("PURCHASE_FILTER_FIELDS", () => {
  it("recorta por situação", () => {
    expect(PURCHASE_FILTER_FIELDS.situation.match(row(), "ACTIVE")).toBe(true);
    expect(PURCHASE_FILTER_FIELDS.situation.match(row(), "INACTIVE")).toBe(
      false
    );
  });

  it("recorta por fábrica", () => {
    expect(PURCHASE_FILTER_FIELDS.factoryId.match(row(), "f1")).toBe(true);
    expect(PURCHASE_FILTER_FIELDS.factoryId.match(row(), "f2")).toBe(false);
  });

  it("busca o cliente sem exigir a caixa certa", () => {
    expect(PURCHASE_FILTER_FIELDS.search.match(row(), "bom preço")).toBe(true);
    expect(PURCHASE_FILTER_FIELDS.search.match(row(), "ZETA")).toBe(false);
  });
});

describe("factoryOptions", () => {
  it("lista as fábricas das próprias linhas, sem repetir e em ordem", () => {
    const rows = [
      row({ factoryId: "f2", factoryName: "Delta" }),
      row(),
      row({ factoryId: "f2", factoryName: "Delta" }),
    ];
    expect(factoryOptions(rows)).toEqual([
      { value: "f2", label: "Delta" },
      { value: "f1", label: "HERC" },
    ]);
  });
});

describe("rótulos da linha", () => {
  it("diz 'nunca comprou desta fábrica' em vez de fingir um tempo parado", () => {
    expect(idleLabel(row({ daysSinceLastOrder: null }))).toBe(
      "nunca comprou desta fábrica"
    );
    expect(idleLabel(row({ daysSinceLastOrder: 1 }))).toBe("há 1 dia");
  });

  it("não inventa ritmo para quem só comprou uma vez", () => {
    expect(cadenceLabel(row({ avgIntervalDays: null }))).toBe("—");
    expect(cadenceLabel(row({ avgIntervalDays: 30 }))).toBe("a cada 30 dias");
  });

  it("mostra o número do pedido como os 8 primeiros caracteres do id", () => {
    expect(orderNumber(row())).toBe("ABCDEF12");
    expect(orderNumber(row({ lastOrderId: null }))).toBe("—");
  });

  it("escreve 'nunca' quando o par não tem compra alguma", () => {
    expect(lastPurchaseLabel(row())).toBe("30/07/2026");
    expect(lastPurchaseLabel(row({ lastOrderDate: null }))).toBe("nunca");
  });
});

describe("rowHref", () => {
  // O assunto da linha é a compra: o clique tem de levar ao que foi comprado.
  it("leva ao pedido da última compra", () => {
    expect(rowHref(row())).toBe("/orders/abcdef12-3456-7890-abcd-ef1234567890");
  });

  it("leva ao cliente quando nunca houve compra", () => {
    expect(rowHref(row({ lastOrderId: null }))).toBe("/clients/cc1");
  });
});

describe("PURCHASE_SORT_COLUMNS", () => {
  it("tem rótulo de papel para toda coluna ordenável", () => {
    // As duas metades são um contrato: uma coluna sem rótulo sairia do PDF sem
    // dizer em que ordem o papel está.
    expect(Object.keys(PURCHASE_SORT_LABELS).sort()).toEqual(
      Object.keys(PURCHASE_SORT_COLUMNS).sort()
    );
  });

  it("ordena dinheiro como número, não como texto", () => {
    expect(
      PURCHASE_SORT_COLUMNS.lastOrderAmount(row({ lastOrderAmount: "900" }))
    ).toBe(900);
  });
});

describe("PURCHASES_PDF_COLUMNS", () => {
  it("tem as colunas da TELA, e nenhuma além delas", () => {
    // O papel é conferido contra a tabela: coluna a mais faz quem confere
    // procurar na tela um dado que não está lá. O número do pedido e a cidade
    // ficam só na planilha.
    expect(PURCHASES_PDF_COLUMNS.map((column) => column.header)).toEqual([
      "CLIENTE",
      "FÁBRICA",
      "SITUAÇÃO",
      "ÚLT. COMPRA",
      "VALOR",
      "PARADO HÁ",
      "RITMO",
      "NO PERÍODO",
    ]);
  });
});

describe("buildPurchasesExportRows", () => {
  it("uma coluna da planilha para cada cabeçalho", () => {
    const [exported] = buildPurchasesExportRows([row()]);
    expect(exported).toHaveLength(PURCHASES_EXPORT_HEADERS.length);
  });

  it("traduz a situação do pedido em português", () => {
    const [exported] = buildPurchasesExportRows([row()]);
    expect(exported).toContain("Confirmado");
  });

  it("marca o par que nunca comprou em vez de deixar a célula vazia", () => {
    const [exported] = buildPurchasesExportRows([
      row({ lastOrderDate: null, lastOrderStatus: null, orderCount: 0 }),
    ]);
    expect(exported).toContain("nunca comprou");
  });
});

describe("summarize", () => {
  it("conta pares, clientes e fábricas distintos do que foi exportado", () => {
    const totals = summarize([
      row(),
      row({ factoryId: "f2", factoryName: "Delta", situation: "AT_RISK" }),
      row({ clientId: "c2", companyClientId: "cc2", situation: "INACTIVE" }),
    ]);
    expect(totals).toMatchObject({
      pairs: 3,
      clients: 2,
      factories: 2,
      atRisk: 1,
      inactive: 1,
      never: 0,
    });
  });
});
