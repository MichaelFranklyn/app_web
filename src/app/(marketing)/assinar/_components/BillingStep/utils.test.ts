import { describe, expect, it } from "vitest";

import { BILLING_STEPS, toBillingData } from "./utils";

const fields = BILLING_STEPS[0].sections[0].fields;

describe("dados de cobrança — campos", () => {
  it("os três são obrigatórios", () => {
    expect(fields.map((f) => f.name)).toEqual([
      "companyName",
      "document",
      "email",
    ]);
    expect(fields.every((f) => f.required)).toBe(true);
  });

  it("CNPJ e e-mail usam os tipos que já validam", () => {
    // O `validateBilling` que existia aqui só contava dígitos: CNPJ impossível
    // (11.111.111/1111-11) passava e só quebrava na emissão da nota.
    expect(fields.find((f) => f.name === "document")?.type).toBe("cnpj");
    expect(fields.find((f) => f.name === "email")?.type).toBe("email");
  });
});

describe("toBillingData", () => {
  it("entrega as três chaves, sem espaço nas pontas", () => {
    expect(
      toBillingData({
        companyName: " Demo LTDA ",
        document: " 11.222.333/0001-81 ",
        email: " a@b.com ",
      })
    ).toEqual({
      companyName: "Demo LTDA",
      document: "11.222.333/0001-81",
      email: "a@b.com",
    });
  });

  it("formulário vazio não vira 'undefined' em texto", () => {
    expect(toBillingData({})).toEqual({
      companyName: "",
      document: "",
      email: "",
    });
  });
});
