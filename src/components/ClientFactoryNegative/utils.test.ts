import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { daysSince, negativeSinceLabel, negativeTooltip } from "./utils";

describe("daysSince", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 6, 15, 30));
  });
  afterEach(() => vi.useRealTimers());

  it("conta dias de calendário, não períodos de 24h", () => {
    // Negativado ontem às 23h continua sendo "1 dia", e não zero — o que se
    // conta é a virada do dia.
    expect(daysSince("2026-09-05")).toBe(1);
    expect(daysSince("2026-09-06")).toBe(0);
    expect(daysSince("2026-08-06")).toBe(31);
  });

  it("aceita datetime e ignora o que não é data", () => {
    expect(daysSince("2026-09-01T12:00:00Z")).toBe(5);
    expect(daysSince(null)).toBeNull();
    expect(daysSince("ontem")).toBeNull();
  });
});

describe("negativeSinceLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 6, 9, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("diz há quanto tempo, além da data", () => {
    // O tempo decorrido é o que separa "é de ontem" de "está assim há meses";
    // a data sozinha obriga o vendedor a fazer a conta de cabeça.
    expect(negativeSinceLabel("2026-08-06")).toBe(
      "Negativado há 31 dias (desde 06/08/2026)"
    );
    expect(negativeSinceLabel("2026-09-05")).toBe(
      "Negativado ontem (05/09/2026)"
    );
    expect(negativeSinceLabel("2026-09-06")).toBe(
      "Negativado hoje (06/09/2026)"
    );
  });

  it("sem data continua dizendo o essencial", () => {
    expect(negativeSinceLabel(null)).toBe("Negativado");
  });
});

describe("negativeTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 6, 9, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("junta o desde quando com o porquê", () => {
    expect(negativeTooltip("2026-09-05", "Boleto protestado")).toBe(
      "Negativado ontem (05/09/2026). Motivo: Boleto protestado"
    );
  });

  it("sem motivo não inventa um", () => {
    expect(negativeTooltip("2026-09-05", null)).toBe(
      "Negativado ontem (05/09/2026)"
    );
  });
});
