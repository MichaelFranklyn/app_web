import { describe, expect, it } from "vitest";
import { normalizeInput } from "./utils";

describe("normalizeInput (editar vendedor)", () => {
  it("inclui só os campos presentes e limpa dígitos de phone/cep", () => {
    const result = normalizeInput({
      name: "João",
      phone: "(11) 98765-4321",
      homeCep: "12345-678",
    });

    expect(result).toEqual({
      name: "João",
      phone: "11987654321",
      homeCep: "12345678",
    });
  });

  it("ignora campos vazios/ausentes (patch parcial)", () => {
    expect(normalizeInput({})).toEqual({});
    expect(normalizeInput({ name: "", region: "Sul" })).toEqual({
      region: "Sul",
    });
  });
});
