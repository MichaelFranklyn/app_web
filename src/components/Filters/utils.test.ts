import { describe, expect, it } from "vitest";

import { FilterField } from "./interface";
import { activeFilterCount, fieldKeys, visibleFields } from "./utils";

const FIELDS: FilterField[] = [
  { type: "select", key: "sellerId", label: "Vendedor", options: [] },
  { type: "select", key: "factoryId", label: "Fábrica", options: [] },
  {
    type: "date-range",
    key: "orderDateFrom",
    toKey: "orderDateTo",
    label: "Data do pedido",
  },
];

describe("fieldKeys", () => {
  it("um select ocupa uma chave", () => {
    expect(fieldKeys(FIELDS[0])).toEqual(["sellerId"]);
  });

  it("um período ocupa as duas pontas", () => {
    expect(fieldKeys(FIELDS[2])).toEqual(["orderDateFrom", "orderDateTo"]);
  });
});

describe("visibleFields", () => {
  it("descarta os campos escondidos", () => {
    const hidden: FilterField[] = [
      ...FIELDS,
      { type: "select", key: "x", label: "X", options: [], hidden: true },
    ];
    expect(visibleFields(hidden)).toHaveLength(3);
  });
});

describe("activeFilterCount", () => {
  it("é zero sem nenhum valor", () => {
    expect(activeFilterCount(FIELDS, {})).toBe(0);
  });

  it("conta um select preenchido", () => {
    expect(activeFilterCount(FIELDS, { sellerId: "abc" })).toBe(1);
  });

  it("conta o período uma vez, mesmo com as duas pontas", () => {
    const count = activeFilterCount(FIELDS, {
      orderDateFrom: "2026-07-01",
      orderDateTo: "2026-07-31",
    });
    expect(count).toBe(1);
  });

  it("conta o período aberto de um lado só", () => {
    expect(activeFilterCount(FIELDS, { orderDateFrom: "2026-07-01" })).toBe(1);
  });

  it("ignora chaves que não pertencem a nenhum campo", () => {
    expect(activeFilterCount(FIELDS, { search: "delta" })).toBe(0);
  });

  it("não conta campo escondido", () => {
    const fields: FilterField[] = [
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        options: [],
        hidden: true,
      },
    ];
    expect(activeFilterCount(fields, { sellerId: "abc" })).toBe(0);
  });
});
