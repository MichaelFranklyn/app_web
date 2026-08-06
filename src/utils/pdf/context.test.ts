import { FilterField } from "@/components/Filters";
import { describe, expect, it } from "vitest";

import { buildReportContext, describeSort, SortLabel } from "./context";

const fields: FilterField[] = [
  {
    type: "select",
    key: "sellerId",
    label: "Vendedor",
    options: [
      { value: "s1", label: "Ana" },
      { value: "s2", label: "Bruno" },
    ],
  },
  {
    type: "date-range",
    key: "orderDateFrom",
    toKey: "orderDateTo",
    label: "Data do pedido",
  },
  { type: "text", key: "search", label: "Busca" },
];

const sortLabels: Record<string, SortLabel> = {
  razao_social: { label: "Cliente", kind: "text" },
  order_date: { label: "Data", kind: "date" },
  total_amount: { label: "Valor", kind: "number" },
};

describe("buildReportContext", () => {
  it("não escreve nada quando nenhum filtro está ativo", () => {
    expect(buildReportContext({ fields, values: {} })).toEqual([]);
  });

  it("traduz o id do select no rótulo que estava na tela", () => {
    const context = buildReportContext({ fields, values: { sellerId: "s2" } });
    expect(context).toContain("Vendedor: Bruno");
  });

  it("descreve o período com as duas pontas e com uma só", () => {
    const both = buildReportContext({
      fields,
      values: { orderDateFrom: "2026-05-01", orderDateTo: "2026-05-31" },
    });
    expect(both).toContain("Data do pedido: 01/05/2026 a 31/05/2026");

    const openEnd = buildReportContext({
      fields,
      values: { orderDateFrom: "2026-05-01" },
    });
    expect(openEnd).toContain("Data do pedido: a partir de 01/05/2026");
  });

  it("registra o recorte da aba, que não é um filtro do painel", () => {
    const context = buildReportContext({
      fields,
      values: {},
      scopeLabel: "Somente: ainda não faturados",
    });
    expect(context[0]).toBe("Somente: ainda não faturados");
  });

  it("fecha o recorte com a ordenação, depois dos filtros", () => {
    const context = buildReportContext({
      fields,
      values: { sellerId: "s1" },
      order: { by: "total_amount", dir: "desc" },
      sortLabels,
    });
    expect(context).toEqual([
      "Vendedor: Ana",
      "Ordenado por: Valor (maior primeiro)",
    ]);
  });
});

describe("describeSort", () => {
  it("escreve a direção na língua da coluna", () => {
    expect(describeSort({ by: "razao_social", dir: "asc" }, sortLabels)).toBe(
      "Ordenado por: Cliente (A → Z)"
    );
    expect(describeSort({ by: "order_date", dir: "desc" }, sortLabels)).toBe(
      "Ordenado por: Data (mais recentes primeiro)"
    );
    expect(describeSort({ by: "total_amount", dir: "asc" }, sortLabels)).toBe(
      "Ordenado por: Valor (menor primeiro)"
    );
  });

  it("cala quando a lista está na ordem padrão", () => {
    expect(describeSort(null, sortLabels)).toBeNull();
  });

  it("cala quando a coluna não tem rótulo, em vez de imprimir o nome do banco", () => {
    expect(
      describeSort({ by: "created_at", dir: "desc" }, sortLabels)
    ).toBeNull();
  });
});
