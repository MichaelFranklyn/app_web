import { describe, expect, it } from "vitest";

import { stockGuessLabel } from "./stockGuess";

const guess = (
  daysSinceStockout: number | null,
  signalConfidence: string | null
) => stockGuessLabel({ daysSinceStockout, signalConfidence });

describe("stockGuessLabel", () => {
  it("mostra o palpite em linguagem de balcão", () => {
    expect(guess(12, "sem_lastro")).toContain("acabado há 12 dias");
    expect(guess(0, "sem_lastro")).toContain("acabar hoje");
    expect(guess(-5, "sem_lastro")).toContain("durar mais 5 dias");
  });

  it("diz de onde veio o palpite", () => {
    // O vendedor precisa saber se está confirmando um número apoiado no
    // histórico de compras ou um chute de 30 dias — a confiança que ele
    // deposita na resposta muda.
    expect(guess(12, "historico")).toContain("pelo histórico");
    expect(guess(12, "fraco")).toContain("estimativa fraca");
    expect(guess(12, "sem_lastro")).toContain("estimativa fraca");
  });

  it("não repete o que já está confirmado", () => {
    // Já foi respondido: mostrar "confirmado há 2 dias" viraria ruído
    // justamente onde não há pergunta a fazer.
    expect(guess(2, "confirmado")).toBeNull();
  });

  it("sem estimativa não inventa palpite", () => {
    // Produto que o cliente nunca comprou: não há o que confirmar, só o que
    // descobrir.
    expect(guess(null, "sem_lastro")).toBeNull();
    expect(guess(null, null)).toBeNull();
  });
});
