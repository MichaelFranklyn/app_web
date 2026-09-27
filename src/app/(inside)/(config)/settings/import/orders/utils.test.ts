import { describe, expect, it } from "vitest";
import { HistoryResult, HistoryRowInput } from "./interface";
import {
  buildRows,
  chunkByOrder,
  guessMapping,
  guessMatches,
  mergeResults,
  missingFields,
} from "./utils";

const HEADERS = [
  "Número do pedido",
  "Data de emissão",
  "Cliente",
  "Nome fantasia",
  "CNPJ",
  "Representada",
  "Vendedor",
  "Código",
  "Produto",
  "Qtde",
  "Preço unitário",
  "Total",
  "Total do pedido",
];

describe("guessMapping", () => {
  const mapping = guessMapping(HEADERS);
  const col = (index: number) => ({ kind: "column", index });

  it("reconhece os títulos de uma exportação da Mercos", () => {
    expect(mapping.externalRef).toEqual(col(0));
    expect(mapping.orderDate).toEqual(col(1));
    expect(mapping.clientDocument).toEqual(col(4));
    expect(mapping.factory).toEqual(col(5));
    expect(mapping.seller).toEqual(col(6));
    expect(mapping.productCode).toEqual(col(7));
    expect(mapping.productName).toEqual(col(8));
    expect(mapping.quantity).toEqual(col(9));
    expect(mapping.unitPrice).toEqual(col(10));
  });

  it("'Total' é o do item, não o 'Total do pedido'", () => {
    expect(mapping.total).toEqual(col(11));
  });

  it("não chuta o que não achou", () => {
    expect(guessMapping(["Coluna A"]).quantity).toEqual({ kind: "none" });
  });
});

describe("missingFields", () => {
  it("pede produto e valor por um dos dois caminhos", () => {
    const mapping = guessMapping(["Data", "CNPJ", "Representada", "Qtde"]);
    expect(missingFields(mapping)).toEqual([
      "Código ou nome do produto",
      "Preço unitário ou valor total",
    ]);
  });
});

describe("guessMatches", () => {
  it("casa o nome parecido e deixa em branco o que não parece nada", () => {
    const options = [
      { id: "f1", label: "Herc Plásticos" },
      { id: "f2", label: "Tigre" },
    ];
    expect(guessMatches(["HERC PLASTICOS", "Amanco"], options)).toEqual({
      "HERC PLASTICOS": "f1",
      Amanco: null,
    });
  });
});

describe("guessMatches — nome contido no outro", () => {
  it("'HERC PLASTICOS' é o 'Herc' do cadastro", () => {
    const options = [
      { id: "f1", label: "Herc" },
      { id: "f2", label: "Tigre Tubos" },
    ];
    expect(guessMatches(["HERC PLASTICOS"], options)).toEqual({
      "HERC PLASTICOS": "f1",
    });
  });

  it("duas opções cabem: sem palpite", () => {
    const options = [
      { id: "f1", label: "Tigre Tubos" },
      { id: "f2", label: "Tigre Metais" },
    ];
    expect(guessMatches(["TIGRE"], options)).toEqual({ TIGRE: null });
  });
});

describe("buildRows", () => {
  const mapping = guessMapping(HEADERS);
  const line = (patch: Partial<Record<number, string>> = {}) => {
    const cells = [
      "M-1",
      "04/05/2026",
      "Loja",
      "Loja",
      "12.345.678/0001-90",
      "HERC",
      "Ana",
      "134",
      "Torneira",
      "12",
      "10,50",
      "126,00",
      "500",
    ];
    Object.entries(patch).forEach(([i, v]) => (cells[Number(i)] = v ?? ""));
    return cells;
  };
  const base = {
    headerIndex: 0,
    mapping,
    factoryByValue: { HERC: "f1" },
    sellerByValue: { Ana: "s1" },
    defaultSellerId: null,
  };

  it("monta a linha da mutation com a linha do Excel", () => {
    const { rows, problems } = buildRows({ ...base, rows: [line()] });
    expect(problems).toEqual([]);
    expect(rows[0]).toEqual({
      row: 2,
      externalRef: "M-1",
      clientDocument: "12.345.678/0001-90",
      factoryId: "f1",
      sellerId: "s1",
      orderDate: "2026-05-04",
      productCode: "134",
      productName: "Torneira",
      quantity: "12",
      unitPrice: "10.5",
      total: "126",
    });
  });

  it("aponta a linha que não dá para ler, sem derrubar as outras", () => {
    const { rows, problems } = buildRows({
      ...base,
      rows: [line({ 1: "ontem" }), line({ 5: "Tigre" }), line()],
    });
    expect(rows).toHaveLength(1);
    expect(problems).toEqual([
      { row: 2, message: "Data do pedido ilegível." },
      { row: 3, message: "Fábrica sem correspondente escolhido." },
    ]);
  });

  it("sem coluna de vendedor, vale o vendedor escolhido", () => {
    const noSeller = { ...mapping, seller: { kind: "none" as const } };
    const { rows } = buildRows({
      ...base,
      mapping: noSeller,
      defaultSellerId: "s9",
      rows: [line()],
    });
    expect(rows[0].sellerId).toBe("s9");
  });
});

describe("chunkByOrder", () => {
  const row = (ref: string, n: number): HistoryRowInput => ({
    row: n,
    externalRef: ref,
    clientDocument: "1",
    factoryId: "f",
    sellerId: "s",
    orderDate: "2026-01-01",
    productCode: String(n),
    productName: null,
    quantity: "1",
    unitPrice: "1",
    total: null,
  });

  it("nunca parte um pedido entre dois lotes", () => {
    const rows = [
      row("A", 1),
      row("A", 2),
      row("B", 3),
      row("B", 4),
      row("C", 5),
    ];
    const chunks = chunkByOrder(rows, 3);
    expect(chunks.map((c) => c.map((r) => r.externalRef))).toEqual([
      ["A", "A"],
      ["B", "B", "C"],
    ]);
  });
});

describe("mergeResults", () => {
  const result = (patch: Partial<HistoryResult>): HistoryResult => ({
    dryRun: true,
    totalRows: 10,
    ordersCreated: 2,
    ordersAlreadyImported: 0,
    ordersSkipped: 1,
    itemsImported: 8,
    itemsSkipped: 2,
    linksCreated: 1,
    issues: [],
    missingProducts: [],
    missingClients: [],
    ...patch,
  });

  it("soma contadores e junta as listas pela chave", () => {
    const merged = mergeResults([
      result({ missingClients: [{ document: "1", rows: 2 }] }),
      result({
        missingClients: [
          { document: "1", rows: 3 },
          { document: "2", rows: 9 },
        ],
      }),
    ]);
    expect(merged.ordersCreated).toBe(4);
    expect(merged.totalRows).toBe(20);
    expect(merged.missingClients).toEqual([
      { document: "2", rows: 9 },
      { document: "1", rows: 5 },
    ]);
  });
});
