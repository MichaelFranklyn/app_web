import { describe, expect, it } from "vitest";

import { SentOrder } from "./interface";
import {
  buildSentOrdersExportRows,
  buildSentOrdersFilters,
  isPendingAtFactory,
  summarizeSentOrders,
} from "./utils";

const order = (over: Partial<SentOrder> = {}): SentOrder => ({
  id: "o1",
  orderDate: "2026-07-05",
  invoicedAt: null,
  totalAmount: "2150.00",
  commissionAmount: "64.50",
  status: "CONFIRMED",
  isDeliveryOverdue: false,
  seller: { id: "s1", name: "Michael" },
  client: {
    id: "c1",
    razaoSocial: "LOJAS BAHIA LTDA",
    nomeFantasia: "Lojas Bahia",
  },
  factory: {
    id: "f1",
    razaoSocial: "DELTA LTDA",
    nomeFantasia: "Delta",
    nickname: null,
  },
  ...over,
});

describe("buildSentOrdersFilters", () => {
  it("recorta pela data do PEDIDO, não pela do faturamento", () => {
    // A pergunta é o que foi mandado no período — inclusive o que a fábrica
    // ainda não faturou, que é o que este papel serve para cobrar.
    const filters = buildSentOrdersFilters({
      from: "2026-07-01",
      to: "2026-07-31",
      sellerId: null,
    });

    const dateFields = filters
      .filter((f) => f.operator === "gte" || f.operator === "lte")
      .map((f) => f.field);
    expect(dateFields).toEqual(["order_date", "order_date"]);
    expect(filters).not.toContainEqual(
      expect.objectContaining({ field: "invoiced_at" })
    );
  });

  it("pede as situações de pedido colocado (orçamento e cancelado ficam fora)", () => {
    const filters = buildSentOrdersFilters({
      from: "2026-07-01",
      to: "2026-07-31",
      sellerId: null,
    });

    expect(filters).toContainEqual({
      field: "status_in",
      operator: "in",
      values: ["CONFIRMED", "INVOICED", "DELIVERED"],
    });
  });
});

describe("isPendingAtFactory", () => {
  it("sem data de faturamento, o pedido está esperando a fábrica", () => {
    expect(isPendingAtFactory(order({ invoicedAt: null }))).toBe(true);
  });

  it("com faturamento lançado, não está mais pendente", () => {
    expect(isPendingAtFactory(order({ invoicedAt: "2026-07-12" }))).toBe(false);
  });
});

describe("summarizeSentOrders", () => {
  it("separa o colocado em faturado e pendente", () => {
    const totals = summarizeSentOrders([
      order({ totalAmount: "1000", invoicedAt: "2026-07-10" }),
      order({ totalAmount: "500", invoicedAt: null }),
      order({ totalAmount: "250", invoicedAt: null }),
    ]);

    expect(totals.count).toBe(3);
    expect(totals.amount).toBe(1750);
    expect(totals.invoicedCount).toBe(1);
    expect(totals.invoicedAmount).toBe(1000);
    expect(totals.pendingCount).toBe(2);
    expect(totals.pendingAmount).toBe(750);
  });

  it("faturado + pendente sempre fecha o total", () => {
    const orders = [
      order({ totalAmount: "300", invoicedAt: "2026-07-01" }),
      order({ totalAmount: "700", invoicedAt: null }),
    ];
    const totals = summarizeSentOrders(orders);
    expect(totals.invoicedAmount + totals.pendingAmount).toBe(totals.amount);
    expect(totals.invoicedCount + totals.pendingCount).toBe(totals.count);
  });

  it("sem linhas devolve tudo zerado", () => {
    expect(summarizeSentOrders([])).toEqual({
      count: 0,
      amount: 0,
      invoicedCount: 0,
      invoicedAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
    });
  });
});

describe("buildSentOrdersExportRows", () => {
  it("escreve traço na coluna de faturamento quando não houve", () => {
    const [row] = buildSentOrdersExportRows(
      [order({ invoicedAt: null })],
      () => "Confirmado"
    );
    expect(row[5]).toBe("—");
  });

  it("grava valor e comissão como número", () => {
    const [row] = buildSentOrdersExportRows([order()], () => "Confirmado");
    expect(row[6]).toBe(2150);
    expect(row[7]).toBe(64.5);
  });
});
