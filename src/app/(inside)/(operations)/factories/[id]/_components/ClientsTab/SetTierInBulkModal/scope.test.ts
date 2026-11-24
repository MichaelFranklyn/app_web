import { describe, expect, it } from "vitest";

import {
  UNGROUPED_KEY,
  citiesToGroups,
  cityKey,
  cityLabel,
  groupsToOptions,
  tierScope,
} from "./scope";

const CITIES = [
  { city: "Fortaleza", state: "CE", clients: 12 },
  { city: "Sobral", state: "CE", clients: 5 },
  { city: "", state: "", clients: 1 },
];
const CITY_GROUPS = citiesToGroups(CITIES);

describe("tierScope", () => {
  it("só estas cidades: conta os clientes delas", () => {
    expect(tierScope(CITY_GROUPS, [cityKey(CITIES[0])], "only")).toEqual({
      total: 18,
      affected: 12,
      untouched: 6,
    });
  });

  it("todas menos estas: o interior é o resto, inclusive sem cidade", () => {
    expect(tierScope(CITY_GROUPS, [cityKey(CITIES[0])], "except")).toEqual({
      total: 18,
      affected: 6,
      untouched: 12,
    });
  });

  it("nada escolhido no modo 'só estas' não muda ninguém", () => {
    expect(tierScope(CITY_GROUPS, [], "only").affected).toBe(0);
  });

  it("segmento: 'todos, menos os distribuidores' pega também os sem segmento", () => {
    const groups = groupsToOptions(
      [
        { id: "d", name: "Distribuidor", clients: 3 },
        { id: "v", name: "Varejo", clients: 7 },
        { id: null, name: "", clients: 2 },
      ],
      "SEGMENT"
    );
    expect(tierScope(groups, ["d"], "except").affected).toBe(9);
    expect(tierScope(groups, [UNGROUPED_KEY], "only").affected).toBe(2);
  });
});

describe("rótulos", () => {
  it("cidade, UF e contagem no plural certo", () => {
    expect(cityLabel(CITIES[0])).toBe("Fortaleza/CE · 12 clientes");
    expect(cityLabel(CITIES[2])).toBe("Sem cidade · 1 cliente");
  });

  it("o grupo sem id vira 'Sem segmento' / 'Sem rede'", () => {
    const none = { id: null, name: "", clients: 4 };
    expect(groupsToOptions([none], "SEGMENT")[0]).toEqual({
      key: UNGROUPED_KEY,
      label: "Sem segmento · 4 clientes",
      clients: 4,
    });
    expect(groupsToOptions([none], "NETWORK")[0].label).toBe(
      "Sem rede · 4 clientes"
    );
  });
});
