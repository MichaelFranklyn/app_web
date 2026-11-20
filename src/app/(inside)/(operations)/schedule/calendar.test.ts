import { describe, expect, it } from "vitest";

import type { AgendaDay } from "./calendar";
import {
  agendaTitle,
  alsoInOfficeOf,
  indexDays,
  isPlannableBlankWeek,
  itemClient,
  monthGrid,
  mondayOf,
  shiftAnchor,
  splitOtherOffices,
  weekStartsFor,
} from "./calendar";
import { CrossOfficeStop, VisitSchedule, VisitScheduleItem } from "./interface";

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
    expect(agendaTitle("day", "2026-10-18")).toBe("Domingo, 18/10/2026");
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

describe("isPlannableBlankWeek", () => {
  const dates = ["2026-11-09", "2026-11-10", "2026-11-11"];
  const blank = new Map<string, AgendaDay>();
  const withItem = (date: string) =>
    new Map<string, AgendaDay>([
      [
        date,
        {
          date,
          scheduleId: "s1",
          day: { items: [{ id: "i1" }] } as unknown as AgendaDay["day"],
          otherOffices: [],
          alsoInOffice: new Map(),
        },
      ],
    ]);

  it("semana vazia com dia aberto pela frente pede montagem", () => {
    expect(isPlannableBlankWeek(dates, blank, "2026-11-10", new Set())).toBe(
      true
    );
  });

  it("um compromisso qualquer já tira o aviso", () => {
    expect(
      isPlannableBlankWeek(
        dates,
        withItem("2026-11-09"),
        "2026-11-10",
        new Set()
      )
    ).toBe(false);
  });

  it("semana que já passou não oferece montar", () => {
    expect(isPlannableBlankWeek(dates, blank, "2026-11-12", new Set())).toBe(
      false
    );
  });

  it("dias restantes todos de folga não oferecem montar", () => {
    expect(
      isPlannableBlankWeek(
        dates,
        blank,
        "2026-11-10",
        new Set(["2026-11-10", "2026-11-11"])
      )
    ).toBe(false);
  });
});

describe("paradas do outro escritório", () => {
  const stop = (over: Partial<CrossOfficeStop>): CrossOfficeStop => ({
    id: "x1",
    companyId: "co2",
    officeName: "Escritório Sul",
    date: "2026-10-14",
    status: "PENDING",
    contactType: "IN_PERSON",
    plannedOrder: 1,
    isManual: false,
    outcome: null,
    clientId: "c1",
    clientName: "Loja Um",
    city: "Campinas",
    state: "SP",
    neighborhood: "Centro",
    address: "Rua A, 10",
    factoryName: null,
    ...over,
  });
  const visitTo = (clientId: string, contactType = "IN_PERSON") =>
    ({
      id: `i-${clientId}`,
      contactType,
      client: { id: clientId, razaoSocial: "Loja" },
      clientFactoryLink: null,
    }) as unknown as VisitScheduleItem;

  it("a visita ao mesmo cliente vira selo; o resto ganha cartão, na ordem", () => {
    const { otherOffices, alsoInOffice } = splitOtherOffices(
      [visitTo("c1")],
      [
        stop({ id: "x3", clientId: "c3", plannedOrder: 3 }),
        stop({ id: "x1", clientId: "c1" }),
        stop({ id: "x2", clientId: "c2", plannedOrder: 2 }),
      ]
    );
    expect(alsoInOffice.get("c1")).toBe("Escritório Sul");
    expect(otherOffices.map((s) => s.id)).toEqual(["x2", "x3"]);
  });

  it("ligação não se junta: nem a de lá, nem a de cá", () => {
    const remoteThere = splitOtherOffices(
      [visitTo("c1")],
      [stop({ contactType: "REMOTE" })]
    );
    expect(remoteThere.alsoInOffice.size).toBe(0);
    expect(remoteThere.otherOffices).toHaveLength(1);

    const remoteHere = splitOtherOffices([visitTo("c1", "REMOTE")], [stop({})]);
    expect(remoteHere.alsoInOffice.size).toBe(0);
    expect(remoteHere.otherOffices).toHaveLength(1);
  });

  it("o selo só vale para a visita presencial com par", () => {
    const map = new Map([["c1", "Escritório Sul"]]);
    expect(alsoInOfficeOf(visitTo("c1"), map)).toBe("Escritório Sul");
    expect(alsoInOfficeOf(visitTo("c1", "REMOTE"), map)).toBeNull();
    expect(alsoInOfficeOf(visitTo("c2"), map)).toBeNull();
    expect(alsoInOfficeOf(visitTo("c1"), undefined)).toBeNull();
  });

  it("indexa as paradas pelo dia, mesmo onde aqui não há semana", () => {
    const index = indexDays(
      [],
      ["2026-10-14", "2026-10-15"],
      [stop({ date: "2026-10-14T00:00:00" })]
    );
    expect(index.get("2026-10-14")?.otherOffices).toHaveLength(1);
    expect(index.get("2026-10-15")?.otherOffices).toEqual([]);
    expect(index.get("2026-10-14")?.day).toBeNull();
  });
});
