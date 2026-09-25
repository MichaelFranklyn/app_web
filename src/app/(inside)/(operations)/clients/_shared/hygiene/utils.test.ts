import { describe, expect, it } from "vitest";

import {
  describeReceitaChanges,
  isWalletActive,
  walletStatusLabel,
} from "./utils";

describe("situação na carteira", () => {
  it("fala como quem usa, não como cadastro", () => {
    expect(walletStatusLabel("CLOSED")).toBe("Não existe mais");
    expect(walletStatusLabel("ENDED")).toBe("Não trabalhamos mais");
    expect(walletStatusLabel("SUCCEEDED")).toBe("Mudou de CNPJ");
  });

  it("sem situação (resposta antiga ou mock) é ativo", () => {
    // O backend anterior à higienização não manda `status`: tratar a ausência
    // como encerrado esconderia a carteira inteira.
    expect(isWalletActive(undefined)).toBe(true);
    expect(walletStatusLabel(null)).toBe("Ativo");
    expect(isWalletActive("ENDED")).toBe(false);
  });
});

describe("o que a Receita trouxe", () => {
  it("diz o que mudou, campo a campo", () => {
    expect(
      describeReceitaChanges([
        {
          field: "razaoSocial",
          before: "MERCADO VELHO LTDA",
          after: "MERCADO NOVO LTDA",
        },
      ])
    ).toBe('Razão social: "MERCADO VELHO LTDA" → "MERCADO NOVO LTDA"');
  });

  it("sem mudança, diz que já estava certo", () => {
    expect(describeReceitaChanges([])).toMatch(/já estava atualizado/);
  });
});
