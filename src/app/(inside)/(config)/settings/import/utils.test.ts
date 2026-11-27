import { describe, expect, it } from "vitest";

import { HistoryResult, HistoryRowInput, SetupStep } from "./interface";
import { blockingStep, chunkByOrder, mergeResults } from "./utils";

const steps = (done: Partial<Record<SetupStep["key"], boolean>>): SetupStep[] =>
  (
    [
      ["SELLERS", true],
      ["FACTORIES", true],
      ["PRICE_LISTS", true],
      ["CLIENTS", false],
      ["ORDER_HISTORY", false],
    ] as const
  ).map(([key, isRequired]) => ({ key, isRequired, isDone: !!done[key] }));

describe("blockingStep", () => {
  it("o primeiro passo nunca trava", () => {
    expect(blockingStep(steps({}), 0)).toBeNull();
  });

  it("trava no primeiro obrigatório anterior que falta", () => {
    const list = steps({});
    expect(blockingStep(list, 1)).toBe("SELLERS");
    expect(blockingStep(list, 4)).toBe("SELLERS");
    expect(blockingStep(steps({ SELLERS: true }), 3)).toBe("FACTORIES");
  });

  it("libera quando os obrigatórios anteriores estão feitos", () => {
    const list = steps({ SELLERS: true, FACTORIES: true });
    expect(blockingStep(list, 2)).toBeNull();
    expect(blockingStep(list, 3)).toBe("PRICE_LISTS");
  });

  it("clientes (opcional) não trava o histórico", () => {
    const list = steps({ SELLERS: true, FACTORIES: true, PRICE_LISTS: true });
    expect(blockingStep(list, 4)).toBeNull();
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
    status: "DELIVERED",
    clientName: null,
    invoiceNumber: null,
    invoicedAt: null,
    paymentTerms: null,
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
    clientsCreated: 1,
    productsCreated: 0,
    installmentsCreated: 3,
    issues: [],
    missingProducts: [],
    missingClients: [],
    newPaymentTerms: [],
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
    expect(merged.installmentsCreated).toBe(6);
    expect(merged.clientsCreated).toBe(2);
    expect(merged.missingClients).toEqual([
      { document: "2", rows: 9 },
      { document: "1", rows: 5 },
    ]);
  });

  it("conta uma vez o prazo novo que volta em várias partes", () => {
    const term = { factoryId: "f1", factory: null, name: "30/60/90/120" };
    const merged = mergeResults([
      result({ newPaymentTerms: [term] }),
      result({
        newPaymentTerms: [term, { ...term, factoryId: "f2" }],
      }),
    ]);
    expect(merged.newPaymentTerms).toHaveLength(2);
  });
});
