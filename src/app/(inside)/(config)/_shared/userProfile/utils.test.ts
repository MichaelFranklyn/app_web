import { describe, expect, it } from "vitest";
import { formatAddressLine, formatTime, formatWorkDays } from "./utils";

describe("formatWorkDays", () => {
  it("ordena pela semana, não pela ordem em que foi salvo", () => {
    expect(formatWorkDays([5, 1, 3])).toBe("Seg, Qua, Sex");
  });
});

describe("formatTime", () => {
  it("corta os segundos que o backend manda no Time", () => {
    expect(formatTime("08:00:00")).toBe("08:00");
  });
});

describe("formatAddressLine", () => {
  const base = {
    street: "Rua das Acácias",
    number: "120",
    complement: null,
    neighborhood: "Pituba",
    city: "Salvador",
    state: "BA",
    zip: "41820000",
  };

  it("mascara o CEP, que é guardado só com dígitos", () => {
    expect(formatAddressLine(base)).toBe(
      "Rua das Acácias, 120 · Pituba · Salvador - BA · 41820-000"
    );
  });

  it("pula o que estiver vazio, sem deixar separador solto", () => {
    expect(
      formatAddressLine({
        ...base,
        number: null,
        neighborhood: null,
        zip: null,
      })
    ).toBe("Rua das Acácias · Salvador - BA");
  });

  it("devolve string vazia quando não há endereço nenhum", () => {
    expect(
      formatAddressLine({
        street: null,
        number: null,
        complement: null,
        neighborhood: null,
        city: null,
        state: null,
        zip: null,
      })
    ).toBe("");
  });
});
