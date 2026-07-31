import { describe, expect, it } from "vitest";

import { buildQueryFilters } from "@/hooks/useTableData";
import { formatCity, STATE_OPTIONS, TABLE_FIELDS } from "./utils";

describe("formatCity", () => {
  it("junta cidade e UF", () => {
    expect(formatCity("Salvador", "BA")).toBe("Salvador / BA");
  });

  it("mostra o que tiver quando falta uma das pontas", () => {
    expect(formatCity("Salvador", null)).toBe("Salvador");
    expect(formatCity(null, "BA")).toBe("BA");
  });

  it("cai no traço quando não há endereço", () => {
    expect(formatCity(null, null)).toBe("—");
  });
});

describe("TABLE_FIELDS", () => {
  it("busca por razão social e nome fantasia com like (o backend combina com OR)", () => {
    expect(buildQueryFilters(TABLE_FIELDS, { search: "padaria" })).toEqual([
      {
        field: "razao_social,nome_fantasia",
        operator: "like",
        value: "padaria",
      },
    ]);
  });

  it("traduz os filtros do painel nas colunas do backend", () => {
    expect(
      buildQueryFilters(TABLE_FIELDS, {
        sellerId: "s1",
        state: "BA",
        needsAttention: "true",
      })
    ).toEqual([
      { field: "seller_id", operator: "eq", value: "s1" },
      { field: "address_state", operator: "eq", value: "BA" },
      { field: "is_needs_attention", operator: "eq", value: "true" },
    ]);
  });

  it("manda 'false' quando a pessoa pede só os cadastros sem pendência", () => {
    // Não pode virar "campo sem valor": "false" é uma escolha, não a ausência
    // de filtro — quem escolheu isso não quer ver a carteira inteira.
    expect(
      buildQueryFilters(TABLE_FIELDS, { needsAttention: "false" })
    ).toEqual([
      { field: "is_needs_attention", operator: "eq", value: "false" },
    ]);
  });

  it("ignora campo sem valor", () => {
    expect(buildQueryFilters(TABLE_FIELDS, {})).toEqual([]);
  });
});

describe("STATE_OPTIONS", () => {
  it("traz as 27 unidades da federação, sem repetir", () => {
    expect(STATE_OPTIONS).toHaveLength(27);
    expect(new Set(STATE_OPTIONS.map((o) => o.value)).size).toBe(27);
  });

  it("usa a sigla como valor e como rótulo (é o que a coluna Cidade mostra)", () => {
    STATE_OPTIONS.forEach((option) => {
      expect(option.label).toBe(option.value);
      expect(option.value).toMatch(/^[A-Z]{2}$/);
    });
  });
});
