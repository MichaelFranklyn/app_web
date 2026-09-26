import { describe, expect, it } from "vitest";

import { mapsAddressQuery } from "./utils";

const base = {
  addressStreet: null,
  addressNumber: null,
  addressNeighborhood: null,
  addressCity: null,
  addressState: null,
  addressZip: null,
};

describe("mapsAddressQuery", () => {
  it("monta o endereço sem os rótulos da tela", () => {
    expect(
      mapsAddressQuery({
        ...base,
        addressStreet: "Rua A",
        addressNumber: "10",
        addressNeighborhood: "Centro",
        addressCity: "Salvador",
        addressState: "BA",
        addressZip: "40000-000",
      })
    ).toBe("Rua A, 10, Centro, Salvador - BA, 40000-000");
  });

  it("só a cidade já localiza", () => {
    expect(
      mapsAddressQuery({
        ...base,
        addressCity: "Feira de Santana",
        addressState: "BA",
      })
    ).toBe("Feira de Santana - BA");
  });

  it("sem rua nem cidade não há o que mostrar", () => {
    expect(
      mapsAddressQuery({ ...base, addressState: "BA", addressZip: "1" })
    ).toBeNull();
  });
});
