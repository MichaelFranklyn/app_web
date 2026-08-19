import { describe, expect, it } from "vitest";

import { buildQueryFilters } from "@/hooks/useTableData";
import { OrdersStats } from "./interface";
import {
  buildOrderKpis,
  ORDER_SORT_LABELS,
  ORDER_SORTABLE_FIELDS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  ORDER_TABLE_FIELDS,
  PENDING_ORDER_TABLE_FIELDS,
} from "./utils";

const stats = (over: Partial<OrdersStats["orderStats"]> = {}): OrdersStats => ({
  orderStats: {
    totalOrders: 10,
    totalAmount: "1000",
    avgTicket: "100",
    invoicedOrders: 4,
    invoicedAmount: "400",
    commissionAmount: "20",
    ...over,
  },
});

describe("ORDER_SORTABLE_FIELDS", () => {
  it("aceita ordenar por cliente, fábrica e vendedor", () => {
    // Não são colunas de `orders`: quem faz o ORDER BY alcançar a tabela
    // vizinha é o repositório de pedidos. Se a allowlist do cliente não os
    // trouxer, o clique no cabeçalho não vira consulta nenhuma.
    expect(ORDER_SORTABLE_FIELDS).toEqual(
      expect.arrayContaining(["client_name", "factory_name", "seller_name"])
    );
  });

  it("dá nome de papel a cada campo ordenável", () => {
    ORDER_SORTABLE_FIELDS.forEach((field) => {
      expect(ORDER_SORT_LABELS[field]).toBeTruthy();
    });
  });
});

describe("ORDER_TABLE_FIELDS", () => {
  it("traduz o período do pedido em duas pontas (gte + lte) da mesma coluna", () => {
    const filters = buildQueryFilters(ORDER_TABLE_FIELDS, {
      orderDateFrom: "2026-07-01",
      orderDateTo: "2026-07-31",
    });

    expect(filters).toEqual([
      { field: "order_date", operator: "gte", value: "2026-07-01" },
      { field: "order_date", operator: "lte", value: "2026-07-31" },
    ]);
  });

  it("traduz o período de faturamento em invoiced_at", () => {
    const filters = buildQueryFilters(ORDER_TABLE_FIELDS, {
      invoicedFrom: "2026-07-01",
    });

    expect(filters).toEqual([
      { field: "invoiced_at", operator: "gte", value: "2026-07-01" },
    ]);
  });

  it("vendedor, fábrica e cliente comparam por igualdade", () => {
    const filters = buildQueryFilters(ORDER_TABLE_FIELDS, {
      sellerId: "s1",
      factoryId: "f1",
      clientId: "c1",
    });

    expect(filters).toEqual([
      { field: "seller_id", operator: "eq", value: "s1" },
      { field: "factory_id", operator: "eq", value: "f1" },
      { field: "client_id", operator: "eq", value: "c1" },
    ]);
  });

  it("manda a situação pelo NOME do enum, que o backend traduz", () => {
    const filters = buildQueryFilters(ORDER_TABLE_FIELDS, {
      status: "CONFIRMED",
    });

    expect(filters).toEqual([
      { field: "status", operator: "eq", value: "CONFIRMED" },
    ]);
  });

  it("ignora campo sem valor", () => {
    expect(buildQueryFilters(ORDER_TABLE_FIELDS, {})).toEqual([]);
  });
});

describe("PENDING_ORDER_TABLE_FIELDS", () => {
  it("não filtra por situação — a aba já é um recorte por situação", () => {
    expect(PENDING_ORDER_TABLE_FIELDS.status).toBeUndefined();
    // Um `?status=` herdado da outra aba não pode continuar valendo escondido.
    expect(
      buildQueryFilters(PENDING_ORDER_TABLE_FIELDS, { status: "DELIVERED" })
    ).toEqual([]);
  });

  it("mantém os demais filtros da lista", () => {
    expect(
      buildQueryFilters(PENDING_ORDER_TABLE_FIELDS, { factoryId: "f1" })
    ).toEqual([{ field: "factory_id", operator: "eq", value: "f1" }]);
  });
});

describe("ORDER_STATUS_OPTIONS", () => {
  it("oferece toda situação que a coluna Situação sabe exibir", () => {
    expect(ORDER_STATUS_OPTIONS.map((option) => option.value).sort()).toEqual(
      Object.keys(ORDER_STATUS_LABELS).sort()
    );
  });

  it("usa no filtro a mesma palavra que a linha mostra", () => {
    ORDER_STATUS_OPTIONS.forEach((option) => {
      expect(option.label).toBe(ORDER_STATUS_LABELS[option.value]);
    });
  });

  it("segue o caminho do pedido, do orçamento ao cancelado", () => {
    expect(ORDER_STATUS_OPTIONS[0].value).toBe("DRAFT");
    expect(ORDER_STATUS_OPTIONS.at(-1)?.value).toBe("CANCELLED");
  });
});

describe("buildOrderKpis", () => {
  it("expõe o faturado e a comissão do recorte", () => {
    const [, , faturado, comissao] = buildOrderKpis(stats());
    expect(faturado.value).toContain("400");
    expect(faturado.delta).toBe("4 de 10 pedidos faturados");
    expect(comissao.value).toContain("20");
  });

  it("mostra o ticket médio junto do valor total", () => {
    const [, valorTotal] = buildOrderKpis(stats());
    expect(valorTotal.delta).toContain("100");
  });

  it("muda a legenda quando há filtro ativo", () => {
    // "feitos" não é enfeite: os cartões contam só confirmado/faturado/entregue
    // (ver `_apply_placed_only` no backend), e a lista abaixo mostra também
    // orçamento e cancelado — o número menor precisa se explicar.
    expect(buildOrderKpis(stats(), false)[0].delta).toBe(
      "pedidos feitos da empresa"
    );
    expect(buildOrderKpis(stats(), true)[0].delta).toBe(
      "pedidos feitos no filtro atual"
    );
  });

  it("degrada para zeros quando o backend não devolve orderStats", () => {
    const kpis = buildOrderKpis({} as OrdersStats);
    expect(kpis[0].value).toBe("0");
    expect(kpis[2].delta).toBe("0 de 0 pedidos faturados");
  });
});
