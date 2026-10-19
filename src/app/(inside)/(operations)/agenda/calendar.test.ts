import { describe, expect, it } from "vitest";

import {
  agendaTitle,
  indexDays,
  itemClient,
  monthGrid,
  mondayOf,
  shiftAnchor,
  weekStartsFor,
} from "./calendar";
import { VisitSchedule, VisitScheduleItem } from "./interface";

describe("calendário da agenda", () => {
  it("a semana começa na segunda, inclusive vista do domingo", () => {
    expect(mondayOf("2026-10-18")).toBe("2026-10-12"); // domingo
    expect(mondayOf("2026-10-12")).toBe("2026-10-12");
    expect(mondayOf("2026-10-14")).toBe("2026-10-12");
  });

  it("o mês cobre semanas inteiras, de segunda a domingo", () => {
    const weeks = monthGrid("2026-10-18");
    expect(weeks[0][0]).toBe("2026-09-28"); // 1º de outubro é quinta
    expect(weeks.at(-1)?.at(-1)).toBe("2026-11-01");
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it("fevereiro que começa na segunda tem só quatro linhas", () => {
    expect(monthGrid("2027-02-10")).toHaveLength(4);
  });

  it("a visão busca uma semana; o mês, todas as dele", () => {
    expect(weekStartsFor("day", "2026-10-15")).toEqual(["2026-10-12"]);
    expect(weekStartsFor("week", "2026-10-15")).toEqual(["2026-10-12"]);
    expect(weekStartsFor("month", "2026-10-15")).toHaveLength(5);
  });

  it("anda um dia, uma semana ou um mês", () => {
    expect(shiftAnchor("day", "2026-10-31", 1)).toBe("2026-11-01");
    expect(shiftAnchor("week", "2026-10-15", -1)).toBe("2026-10-08");
    // 31 de janeiro + 1 mês não pode cair em março.
    expect(shiftAnchor("month", "2027-01-31", 1)).toBe("2027-02-01");
  });

  it("o título diz o período como a folhinha", () => {
    expect(agendaTitle("day", "2026-10-18")).toBe(
      "domingo, 18 de outubro de 2026"
    );
    expect(agendaTitle("week", "2026-10-15")).toBe(
      "12 – 18 de outubro de 2026"
    );
    expect(agendaTitle("week", "2026-10-01")).toBe("28 set – 4 out de 2026");
    // Virada do ano: o ano vai nas duas pontas.
    expect(agendaTitle("week", "2026-12-30")).toBe(
      "28 dez de 2026 – 3 jan de 2027"
    );
    expect(agendaTitle("month", "2026-10-18")).toBe("outubro de 2026");
  });

  it("o cliente vem da parada ou do vínculo", () => {
    const client = { id: "c1", razaoSocial: "Loja" } as never;
    expect(
      itemClient({
        client,
        clientFactoryLink: null,
      } as unknown as VisitScheduleItem)
    ).toBe(client);
    expect(
      itemClient({ client: null, clientFactoryLink: { client } } as never)
    ).toBe(client);
  });

  it("indexa os dias das semanas buscadas e diz de qual semana é o dia vazio", () => {
    const schedule = {
      id: "s1",
      weekStart: "2026-10-12",
      days: [{ id: "d1", date: "2026-10-14", items: [] }],
    } as unknown as VisitSchedule;
    const index = indexDays(
      [schedule],
      ["2026-10-14", "2026-10-15", "2026-10-20"]
    );
    expect(index.get("2026-10-14")).toMatchObject({
      scheduleId: "s1",
      day: { id: "d1" },
    });
    expect(index.get("2026-10-15")).toMatchObject({
      scheduleId: "s1",
      day: null,
    });
    expect(index.get("2026-10-20")).toMatchObject({
      scheduleId: null,
      day: null,
    });
  });
});
