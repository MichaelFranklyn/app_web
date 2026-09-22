import { describe, expect, it } from "vitest";

import { buildAnswers } from "./utils";

/**
 * O que se prende aqui é o que SAI do formulário para o backend.
 *
 * A folha é respondida no celular, no fim do dia, e quase nunca inteira. A
 * regra que faz isso funcionar é uma só: só vai o que o vendedor respondeu — e
 * ela precisa valer para cada campo, não só para a linha.
 */

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, value));
  return data;
};

describe("buildAnswers", () => {
  it("manda só as paradas cuja situação foi escolhida", () => {
    // O que ficou em branco é a informação de que ele ainda não sabe. Mandar
    // "pendente" gravaria um desfecho que ninguém deu.
    const answers = buildAnswers(
      form({
        status__a: "COMPLETED",
        status__b: "",
        notes__b: "passei mas estava fechado",
      })
    );

    expect(answers).toEqual([{ itemId: "a", status: "COMPLETED" }]);
  });

  it("leva resultado e observação quando preenchidos", () => {
    const answers = buildAnswers(
      form({
        status__a: "COMPLETED",
        outcome__a: "NOT_BOUGHT",
        notes__a: "  volta dia 5  ",
      })
    );

    expect(answers[0]).toEqual({
      itemId: "a",
      status: "COMPLETED",
      outcome: "NOT_BOUGHT",
      notes: "volta dia 5",
    });
  });

  it("observação em branco não viaja", () => {
    // Campo vazio não pode apagar a anotação que o planejamento deixou ali.
    const answers = buildAnswers(
      form({ status__a: "COMPLETED", notes__a: "   ", outcome__a: "" })
    );

    expect(answers[0]).toEqual({ itemId: "a", status: "COMPLETED" });
  });

  it("caixa marcada vira hadOrder", () => {
    const answers = buildAnswers(
      form({ status__a: "COMPLETED", order__a: "on" })
    );

    expect(answers[0].hadOrder).toBe(true);
  });

  it("caixa desmarcada não manda hadOrder: ela some do FormData", () => {
    // Comportamento nativo do checkbox — o não marcado simplesmente não é
    // enviado. Mandar `false` explicitamente é o que faria o back desamarrar um
    // pedido que alguém já tinha amarrado.
    const answers = buildAnswers(form({ status__a: "COMPLETED" }));

    expect(answers[0]).not.toHaveProperty("hadOrder");
  });

  it("dia inteiro em branco não gera envio nenhum", () => {
    expect(buildAnswers(form({ status__a: "", status__b: "" }))).toEqual([]);
  });

  it("id com underscore sobrevive ao prefixo", () => {
    // Os ids são UUID, mas o nome do campo é montado por concatenação: se um
    // dia o id mudar de forma, o corte tem de continuar sendo só o prefixo.
    const answers = buildAnswers(form({ status__a_b__c: "COMPLETED" }));

    expect(answers[0].itemId).toBe("a_b__c");
  });
});
