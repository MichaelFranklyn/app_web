import { describe, expect, it } from "vitest";

import { buildDepartureAddress } from "./utils";

describe("buildDepartureAddress", () => {
  it("monta o endereço completo no formato 'rua, número, bairro, cidade - UF'", () => {
    expect(
      buildDepartureAddress({
        depStreet: "Av. Fernandes Lima",
        depNumber: "100",
        depNeighborhood: "Farol",
        depCity: "Maceió",
        depState: "AL",
      })
    ).toBe("Av. Fernandes Lima, 100, Farol, Maceió - AL");
  });

  it("dispensa número, bairro e UF quando ausentes", () => {
    expect(
      buildDepartureAddress({ depStreet: "Rua A", depCity: "Recife" })
    ).toBe("Rua A, Recife");
  });

  it("retorna null sem o mínimo (rua e cidade)", () => {
    expect(buildDepartureAddress({ depStreet: "Rua A" })).toBeNull();
    expect(buildDepartureAddress({ depCity: "Recife" })).toBeNull();
    expect(buildDepartureAddress({})).toBeNull();
  });

  it("ignora espaços em branco ao validar o mínimo", () => {
    expect(
      buildDepartureAddress({ depStreet: "   ", depCity: "Recife" })
    ).toBeNull();
  });
});
