import { describe, expect, it } from "vitest";

import { VisitResponseStop } from "./interface";
import {
  buildAnswers,
  dayHeading,
  formPeriodLabel,
  groupStopsByDate,
} from "./utils";

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

describe("folha da semana", () => {
  it("o título diz o intervalo na semana e o dia no link diário", () => {
    expect(
      formPeriodLabel({
        date: "2026-09-21",
        endDate: "2026-09-27",
        isWeek: true,
      })
    ).toBe("Semana de 21/09/2026 a 27/09/2026");
    expect(
      formPeriodLabel({ date: "2026-09-21", endDate: null, isWeek: false })
    ).toBe("Rota de 21/09/2026");
  });

  it("o dia não escorrega no fuso do navegador", () => {
    expect(dayHeading("2026-09-21")).toBe("segunda-feira, 21/09/2026");
  });

  it("agrupa as paradas por dia, na ordem recebida", () => {
    const stop = (id: string, date: string) =>
      ({ id, date }) as VisitResponseStop;
    const groups = groupStopsByDate([
      stop("a", "2026-09-21"),
      stop("b", "2026-09-21"),
      stop("c", "2026-09-23"),
    ]);
    expect(groups.map((g) => [g.date, g.stops.map((s) => s.id)])).toEqual([
      ["2026-09-21", ["a", "b"]],
      ["2026-09-23", ["c"]],
    ]);
  });
});
