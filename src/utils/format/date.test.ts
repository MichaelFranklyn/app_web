import { describe, expect, it } from "vitest";
import {
  BRT_TIME_ZONE,
  formatDate,
  formatDateTime,
  getCurrentWeekMondayIso,
  parseLocalDate,
  toIsoDate,
  toUtcIsoDate,
} from "./date";

describe("toIsoDate", () => {
  it("mantém uma data ISO já no formato (sem deslocamento de fuso)", () => {
    expect(toIsoDate("2026-05-31")).toBe("2026-05-31");
    expect(toIsoDate("2026-05-31T12:00:00Z")).toBe("2026-05-31");
  });

  it("formata um Date pelos componentes locais", () => {
    expect(toIsoDate(new Date(2026, 4, 31))).toBe("2026-05-31");
  });

  it("retorna vazio para null/vazio/inválido", () => {
    expect(toIsoDate(null)).toBe("");
    expect(toIsoDate("")).toBe("");
    expect(toIsoDate("data inválida")).toBe("");
  });

  it("formata string não-ISO parseável pelos componentes locais", () => {
    // "2026/05/31" é válido p/ new Date mas não casa o regex ISO → ramo de parse.
    expect(toIsoDate("2026/05/31")).toBe("2026-05-31");
  });
});

describe("toUtcIsoDate", () => {
  it("formata pelos componentes UTC", () => {
    expect(toUtcIsoDate(new Date(Date.UTC(2026, 4, 31)))).toBe("2026-05-31");
  });
});

describe("parseLocalDate", () => {
  it("monta Date local a partir de ISO (sem virar o dia anterior em UTC-3)", () => {
    const d = parseLocalDate("2026-05-31");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(4); // maio (0-based)
    expect(d!.getDate()).toBe(31);
  });

  it("retorna null para null/vazio", () => {
    expect(parseLocalDate(null)).toBeNull();
    expect(parseLocalDate("")).toBeNull();
  });

  it("aceita Date (válido) e devolve o próprio; inválido → null", () => {
    const d = new Date(2026, 0, 15);
    expect(parseLocalDate(d)).toBe(d);
    expect(parseLocalDate(new Date("x"))).toBeNull();
  });

  it("faz parse de string não-ISO válida e null p/ lixo", () => {
    expect(parseLocalDate("2026/01/15")).toBeInstanceOf(Date);
    expect(parseLocalDate("não é data")).toBeNull();
  });
});

describe("formatDate", () => {
  it("formata ISO para dd/mm/aaaa (pt-BR)", () => {
    expect(formatDate("2026-05-31T12:00:00Z")).toBe("31/05/2026");
  });
  it("mantém o dia de uma data pura (sem recuar em fuso negativo)", () => {
    expect(formatDate("2026-05-31")).toBe("31/05/2026");
  });
  it("retorna — p/ ausente ou inválida", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("data inválida")).toBe("—");
  });
  it("com fuso, o instante cai no dia de lá: 01h UTC ainda é ontem em BRT", () => {
    const brt = { timeZone: BRT_TIME_ZONE };
    expect(formatDate("2026-11-11T01:00:00+00:00", "", brt)).toBe("10/11/2026");
    expect(
      formatDate("2026-11-11T01:00:00+00:00", "", { timeZone: "UTC" })
    ).toBe("11/11/2026");
  });
  it("com fuso, a data pura continua o mesmo dia", () => {
    expect(formatDate("2026-05-31", "—", { timeZone: BRT_TIME_ZONE })).toBe(
      "31/05/2026"
    );
  });
  it("com fuso, vazio ou inválido devolve o fallback", () => {
    expect(formatDate(null, "", { timeZone: BRT_TIME_ZONE })).toBe("");
    expect(formatDate("não é data", "", { timeZone: BRT_TIME_ZONE })).toBe("");
  });
});

describe("getCurrentWeekMondayIso", () => {
  it("retorna um ISO yyyy-mm-dd que é uma segunda-feira (UTC)", () => {
    const iso = getCurrentWeekMondayIso();
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // O dia da semana (UTC) da data retornada deve ser segunda (1).
    expect(new Date(`${iso}T00:00:00Z`).getUTCDay()).toBe(1);
  });
});

describe("formatDateTime", () => {
  // Meio-dia UTC: em qualquer fuso brasileiro continua o mesmo dia.
  const iso = "2026-11-24T12:05:09Z";

  it("traz dia, mês, ano curto e hora", () => {
    expect(formatDateTime(iso)).toMatch(/^24\/11\/26,? \d{2}:05$/);
  });

  it("tira o ano e põe os segundos quando pedido", () => {
    expect(formatDateTime(iso, { withYear: false, withSeconds: true })).toMatch(
      /^24\/11,? \d{2}:05:09$/
    );
  });

  it("mostra travessão para vazio ou inválido", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("não é data")).toBe("—");
  });
});
