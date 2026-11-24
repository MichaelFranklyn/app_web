import { describe, expect, it } from "vitest";

import { cityKey, cityLabel, tierScope } from "./scope";

const CITIES = [
  { city: "Fortaleza", state: "CE", clients: 12 },
  { city: "Sobral", state: "CE", clients: 5 },
  { city: "", state: "", clients: 1 },
];

describe("tierScope", () => {
  it("só estas cidades: conta os clientes delas", () => {
    expect(tierScope(CITIES, [cityKey(CITIES[0])], "only")).toEqual({
      total: 18,
      affected: 12,
      untouched: 6,
    });
  });

  it("todas menos estas: o interior é o resto, inclusive sem cidade", () => {
    expect(tierScope(CITIES, [cityKey(CITIES[0])], "except")).toEqual({
      total: 18,
      affected: 6,
      untouched: 12,
    });
  });

  it("nada escolhido no modo 'só estas' não muda ninguém", () => {
    expect(tierScope(CITIES, [], "only").affected).toBe(0);
  });
});

describe("cityLabel", () => {
  it("cidade, UF e contagem no plural certo", () => {
    expect(cityLabel(CITIES[0])).toBe("Fortaleza/CE · 12 clientes");
    expect(cityLabel(CITIES[2])).toBe("Sem cidade · 1 cliente");
  });
});
