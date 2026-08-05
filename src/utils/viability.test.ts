import { describe, expect, it } from "vitest";

import { Viability, stockTiming, viabilityNote } from "./viability";

const viability = (over: Partial<Viability> = {}): Viability => ({
  status: "quase",
  basketValue: "800",
  minimumAmount: "1000",
  missingAmount: "200",
  readyOn: null,
  suggestions: [],
  ...over,
});

describe("viabilityNote", () => {
  it("não fala do mínimo quando o pedido fecha", () => {
    // O estado normal não é informação. Anunciá-lo em toda visita gastaria a
    // atenção do vendedor com o caso que não precisa dela — e ele pararia de
    // ler o aviso justamente onde ele importa.
    expect(viabilityNote(viability({ status: "fecha" }))).toBeNull();
  });

  it("não fala nada quando a fábrica não tem mínimo", () => {
    expect(viabilityNote(null)).toBeNull();
    expect(viabilityNote(undefined)).toBeNull();
  });

  it("falta pouco: diz quanto falta e pede o complemento", () => {
    const note = viabilityNote(
      viability({
        suggestions: [
          {
            productId: "p1",
            productName: "Massa corrida",
            sku: "MC-18",
            quantity: "5",
            value: "300",
            daysUntilOut: 6,
          },
        ],
      })
    );
    expect(note?.tone).toBe("amber");
    // Sem o "R$" nas asserções: `formatMoney` usa Intl, que separa o símbolo do
    // número com espaço NÃO-QUEBRÁVEL (U+00A0). Comparar com espaço comum falha
    // por um caractere invisível.
    expect(note?.message).toContain("200,00");
    expect(note?.message).toContain("1.000,00");
    expect(note?.action).toContain("fechar o pedido");
  });

  it("falta pouco sem sugestão ainda pede conversa", () => {
    const note = viabilityNote(viability());
    expect(note?.action).toContain("conversar");
  });

  it("longe com data de virada vira 'volte no dia X'", () => {
    // É o que transforma "não vá" em uma instrução. Sem a data, o vendedor só
    // ouviria um "não".
    const note = viabilityNote(
      viability({
        status: "longe",
        basketValue: "200",
        missingAmount: "800",
        readyOn: "2026-08-29",
      })
    );
    expect(note?.tone).toBe("red");
    expect(note?.action).toContain("29/08");
  });

  it("longe sem data de virada sugere juntar fábrica ou negociar", () => {
    // O cliente não fecha o mínimo nem esperando: é caso de conversa, não de
    // espera, e a tela não pode fingir que existe um dia para voltar.
    const note = viabilityNote(
      viability({
        status: "longe",
        basketValue: "200",
        missingAmount: "800",
        readyOn: null,
      })
    );
    expect(note?.action).toContain("juntar outra fábrica");
  });
});

describe("stockTiming", () => {
  it("traduz os dias em linguagem de balcão", () => {
    expect(stockTiming(6)).toBe("acaba em 6 dias");
    expect(stockTiming(0)).toBe("acaba hoje");
    expect(stockTiming(-1)).toBe("acabou ontem");
    expect(stockTiming(-5)).toBe("acabou há 5 dias");
  });

  it("sem dado não inventa prazo", () => {
    expect(stockTiming(null)).toBeNull();
  });
});
