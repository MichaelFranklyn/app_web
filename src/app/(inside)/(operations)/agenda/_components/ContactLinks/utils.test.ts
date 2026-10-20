import { describe, expect, it } from "vitest";

import { remoteContactMessage } from "./utils";

describe("remoteContactMessage", () => {
  it("chama o contato pelo nome e se apresenta", () => {
    expect(
      remoteContactMessage({
        contactName: "João da Silva",
        sellerName: "Rafael Souza",
        companyName: "Contato Rep.",
        hour: 9,
      })
    ).toBe(
      "Olá, João, bom dia! Tudo bem? Aqui é Rafael, da Contato Rep. Passando para saber como está o estoque e se posso ajudar com alguma reposição."
    );
  });

  it("sem nomes, a frase continua de pé", () => {
    expect(remoteContactMessage({ hour: 15 })).toBe(
      "Olá, boa tarde! Tudo bem? Passando para saber como está o estoque e se posso ajudar com alguma reposição."
    );
  });
});

describe("pontuação", () => {
  it("empresa sem ponto no fim ganha o ponto da frase", () => {
    expect(
      remoteContactMessage({
        sellerName: "Rafael",
        companyName: "Girus",
        hour: 9,
      })
    ).toContain("Aqui é Rafael, da Girus. Passando");
  });
});
