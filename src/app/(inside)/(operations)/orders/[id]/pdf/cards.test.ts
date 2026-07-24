import { describe, expect, it } from "vitest";

import { OrderDetail } from "../interface";
import { clientCard, factoryCard } from "./cards";

const order = (overrides: Partial<OrderDetail>): OrderDetail =>
  ({
    client: null,
    factory: null,
    seller: null,
    freightType: null,
    ...overrides,
  }) as OrderDetail;

describe("factoryCard", () => {
  it("usa o apelido da fábrica quando existe", () => {
    const card = factoryCard(
      order({
        factory: {
          id: "f1",
          nickname: "Lukma",
          nomeFantasia: "Grupo Lukma",
          razaoSocial: "GRUPO LUKMA LTDA",
          logoUrl: null,
        },
      })
    );
    expect(card.lines[0]).toBe("Lukma");
  });

  it("omite vendedor e frete ausentes em vez de imprimir linha vazia", () => {
    const card = factoryCard(order({}));
    expect(card.lines).toEqual(["—"]);
  });

  it("inclui vendedor e frete quando existem", () => {
    const card = factoryCard(
      order({
        seller: { id: "s1", name: "Ana" },
        freightType: "CIF",
      })
    );
    expect(card.lines).toContain("Vendedor: Ana");
    expect(card.lines).toContain("Frete: CIF");
  });

  it("inclui a condição de pagamento quando fornecida", () => {
    const card = factoryCard(order({}), "30/60 dias");
    expect(card.lines).toContain("Pagamento: 30/60 dias");
  });

  it("omite o pagamento quando não há condição", () => {
    const card = factoryCard(
      order({ seller: { id: "s1", name: "Ana" } }),
      null
    );
    expect(card.lines.some((line) => line.startsWith("Pagamento:"))).toBe(
      false
    );
  });
});

describe("clientCard", () => {
  it("mostra razão social, CNPJ mascarado e cidade", () => {
    const card = clientCard(
      order({
        client: {
          id: "c1",
          razaoSocial: "MERCADO CENTRAL LTDA",
          nomeFantasia: "Mercado Central",
          cnpj: "33000167000101",
          addressCity: "Salvador",
          addressState: "BA",
        },
      })
    );
    expect(card.lines).toEqual([
      "MERCADO CENTRAL LTDA",
      "CNPJ 33.000.167/0001-01",
      "Salvador / BA",
    ]);
  });

  it("não deixa buraco quando falta cidade", () => {
    const card = clientCard(
      order({
        client: {
          id: "c1",
          razaoSocial: "CLIENTE X",
          nomeFantasia: null,
          cnpj: "33000167000101",
          addressCity: null,
          addressState: null,
        },
      })
    );
    expect(card.lines).toHaveLength(2);
  });
});
