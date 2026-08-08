import { describe, expect, it } from "vitest";

import {
  cadenceLabel,
  formatOccurrences,
  optionalIsoDate,
  scheduleSummary,
  weekdayLabel,
} from "./utils";

describe("como o compromisso se lê na tabela", () => {
  it("semanal vira 'Toda terça-feira'", () => {
    expect(scheduleSummary(2, 1)).toBe("Toda terça-feira");
  });

  it("quinzenal diz o dia E a cadência", () => {
    expect(scheduleSummary(4, 2)).toBe("Quinta-feira, de 15 em 15 dias");
  });

  it("cadência fora da lista ainda se lê", () => {
    expect(cadenceLabel(6)).toBe("A cada 6 semanas");
  });

  it("dia da semana usa o ISO do backend (1 = segunda)", () => {
    expect(weekdayLabel(1)).toBe("Segunda-feira");
    expect(weekdayLabel(7)).toBe("Domingo");
    expect(weekdayLabel(0)).toBe("—");
  });
});

describe("próximas datas", () => {
  it("mostra dia/mês separados por ponto", () => {
    expect(formatOccurrences(["2026-08-11", "2026-08-25"])).toBe(
      "11/08 · 25/08"
    );
  });

  it("sem datas, traço", () => {
    expect(formatOccurrences([])).toBe("—");
    expect(formatOccurrences(null)).toBe("—");
  });

  it("não passa por Date — a terça não pode virar segunda", () => {
    // `new Date("2026-08-11")` é meia-noite UTC, que no Brasil é dia 10 às 21h.
    // Formatar por corte de string é o que mantém o dia que o backend mandou.
    expect(formatOccurrences(["2026-08-11"])).toBe("11/08");
  });
});

describe("data opcional do formulário", () => {
  it("campo vazio vira null", () => {
    expect(optionalIsoDate(null)).toBeNull();
    expect(optionalIsoDate("")).toBeNull();
    expect(optionalIsoDate(undefined)).toBeNull();
  });

  it("Date do calendário sai em UTC, sem voltar um dia", () => {
    // Meio-dia local de 11/08: qualquer fuso do Brasil ainda é 11/08 em UTC.
    const escolhido = new Date(2026, 7, 11, 12, 0, 0);
    expect(optionalIsoDate(escolhido)).toBe("2026-08-11");
  });

  it("string ISO da edição passa direto", () => {
    expect(optionalIsoDate("2026-08-11")).toBe("2026-08-11");
  });

  it("texto que não é data vira null", () => {
    expect(optionalIsoDate("amanhã")).toBeNull();
  });
});
