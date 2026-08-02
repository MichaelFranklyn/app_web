import { FilterField } from "@/components/Filters";
import { describe, expect, it } from "vitest";

import { buildOrdersContext } from "./context";

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

describe("buildOrdersContext", () => {
  it("não escreve nada quando nenhum filtro está ativo", () => {
    expect(buildOrdersContext({ fields, values: {} })).toEqual([]);
  });

  it("traduz o id do select no rótulo que estava na tela", () => {
    const context = buildOrdersContext({ fields, values: { sellerId: "s2" } });
    expect(context).toContain("Vendedor: Bruno");
  });

  it("descreve o período com as duas pontas e com uma só", () => {
    const both = buildOrdersContext({
      fields,
      values: { orderDateFrom: "2026-05-01", orderDateTo: "2026-05-31" },
    });
    expect(both).toContain("Data do pedido: 01/05/2026 a 31/05/2026");

    const openEnd = buildOrdersContext({
      fields,
      values: { orderDateFrom: "2026-05-01" },
    });
    expect(openEnd).toContain("Data do pedido: a partir de 01/05/2026");
  });

  it("registra o recorte da aba, que não é um filtro do painel", () => {
    const context = buildOrdersContext({
      fields,
      values: {},
      scopeLabel: "Somente: ainda não faturados",
    });
    expect(context[0]).toBe("Somente: ainda não faturados");
  });
});
