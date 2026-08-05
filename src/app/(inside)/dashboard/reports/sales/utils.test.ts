import { describe, expect, it } from "vitest";

import { SalesReportOrder } from "./interface";
import {
  buildSalesExportRows,
  buildSalesFilters,
  monthsInRange,
  sumBy,
} from "./utils";

const order = (over: Partial<SalesReportOrder> = {}): SalesReportOrder => ({
  id: "o1",
  orderDate: "2026-06-28",
  invoicedAt: "2026-07-03",
  totalAmount: "4820.00",
  commissionAmount: "144.60",
  status: "INVOICED",
  seller: { id: "s1", name: "Rafael" },
  client: {
    id: "c1",
    razaoSocial: "CASA DO SONO LTDA",
    nomeFantasia: "Casa do Sono",
  },
  factory: {
    id: "f1",
    razaoSocial: "INDUSTRIA HERC LTDA",
    nomeFantasia: "Herc",
    nickname: null,
  },
  ...over,
});

describe("buildSalesFilters", () => {
  it("recorta pela data de FATURAMENTO, não pela do pedido", () => {
    // É o que separa este relatório do de pedidos enviados: um pedido de junho
    // faturado em julho é venda de julho.
    const filters = buildSalesFilters({
      from: "2026-07-01",
      to: "2026-07-31",
      sellerId: null,
    });

    const dateFields = filters
      .filter((f) => f.operator === "gte" || f.operator === "lte")
      .map((f) => f.field);
    expect(dateFields).toEqual(["invoiced_at", "invoiced_at"]);
    expect(filters).not.toContainEqual(
      expect.objectContaining({ field: "order_date" })
    );
  });

  it("pede as situações de faturado como lista única (`status_in`)", () => {
    // Três filtros `status` se somariam em E — nenhum pedido está em três
    // situações ao mesmo tempo.
    const filters = buildSalesFilters({
      from: "2026-07-01",
      to: "2026-07-31",
      sellerId: null,
    });

    expect(filters).toContainEqual({
      field: "status_in",
      operator: "in",
      values: ["INVOICED", "DELIVERED"],
    });
  });

  it("inclui o vendedor só quando o gestor escolheu um", () => {
    const semVendedor = buildSalesFilters({
      from: "2026-07-01",
      to: "2026-07-31",
      sellerId: null,
    });
    expect(semVendedor).not.toContainEqual(
      expect.objectContaining({ field: "seller_id" })
    );

    const comVendedor = buildSalesFilters({
      from: "2026-07-01",
      to: "2026-07-31",
      sellerId: "s1",
    });
    expect(comVendedor).toContainEqual({
      field: "seller_id",
      operator: "eq",
      value: "s1",
    });
  });
});

describe("monthsInRange", () => {
  it("um mês fechado conta 1 (gráfico mensal teria uma barra só)", () => {
    expect(monthsInRange("2026-07-01", "2026-07-31")).toBe(1);
  });

  it("conta os meses tocados, não os dias", () => {
    // 31/07 a 01/08 são dois meses, ainda que sejam dois dias.
    expect(monthsInRange("2026-07-31", "2026-08-01")).toBe(2);
    expect(monthsInRange("2026-01-15", "2026-12-20")).toBe(12);
  });

  it("atravessa a virada de ano", () => {
    expect(monthsInRange("2025-12-01", "2026-02-28")).toBe(3);
  });
});

describe("buildSalesExportRows", () => {
  it("grava dinheiro como NÚMERO, para a planilha somar", () => {
    const [row] = buildSalesExportRows([order()], () => "Faturado");
    // As duas últimas colunas são valor e comissão.
    expect(row[6]).toBe(4820);
    expect(row[7]).toBe(144.6);
  });

  it("nomeia como o resto do sistema: cliente pela razão social, fábrica pelo apelido", () => {
    // `clientName` prioriza a razão social (é o que bate com a nota fiscal) e
    // `factoryName`, o apelido/fantasia — o arquivo não pode divergir da tela.
    const [row] = buildSalesExportRows([order()], () => "Faturado");
    expect(row[2]).toBe("CASA DO SONO LTDA");
    expect(row[3]).toBe("Herc");
  });

  it("traduz a situação pelo rótulo recebido", () => {
    const [row] = buildSalesExportRows([order({ status: "DELIVERED" })], (s) =>
      s === "DELIVERED" ? "Entregue" : s
    );
    expect(row[5]).toBe("Entregue");
  });

  it("pedido sem faturamento sai com traço em vez de data vazia", () => {
    const [row] = buildSalesExportRows(
      [order({ invoicedAt: null })],
      () => "x"
    );
    expect(row[0]).toBe("—");
  });
});

describe("sumBy", () => {
  it("soma a coluna monetária das linhas à vista", () => {
    const orders = [
      order({ totalAmount: "100.50" }),
      order({ totalAmount: "200.25" }),
    ];
    expect(sumBy(orders, (o) => o.totalAmount)).toBeCloseTo(300.75, 2);
  });

  it("sem linhas soma zero (não NaN)", () => {
    expect(sumBy([], (o) => o.totalAmount)).toBe(0);
  });
});
