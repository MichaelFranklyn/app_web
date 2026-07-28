import { describe, expect, it } from "vitest";
import { ProfileScheduleConfig } from "../interface";
import { buildRoutineForm, buildRoutineUpdateInput } from "./utils";

const config: ProfileScheduleConfig = {
  id: "cfg-1",
  maxVisitsPerDay: 8,
  workDays: [1, 2, 3, 4, 5],
  workStartTime: "08:00:00",
  workEndTime: "18:00:00",
  isRemoteContactEnabled: true,
  maxRemoteContactsPerDay: 5,
  remoteContactIntervalPct: 50,
  avgVisitDurationMin: 30,
  isRescheduleSameWeek: true,
  maxRescheduleAttempts: 3,
};

describe("buildRoutineForm", () => {
  it("copia os dias em vez de referenciar a config", () => {
    const form = buildRoutineForm(config);
    form.workDays.push(6);

    expect(config.workDays).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("buildRoutineUpdateInput", () => {
  it("não manda nada quando nada mudou", () => {
    expect(buildRoutineUpdateInput(buildRoutineForm(config), config)).toEqual(
      {}
    );
  });

  it("manda só o campo alterado", () => {
    const form = { ...buildRoutineForm(config), maxVisitsPerDay: 10 };

    expect(buildRoutineUpdateInput(form, config)).toEqual({
      maxVisitsPerDay: 10,
    });
  });

  it("compara dias por conteúdo, não por ordem", () => {
    const mesmaSemanaOutraOrdem = {
      ...buildRoutineForm(config),
      workDays: [5, 4, 3, 2, 1],
    };
    const comSabado = {
      ...buildRoutineForm(config),
      workDays: [1, 2, 3, 4, 5, 6],
    };

    expect(buildRoutineUpdateInput(mesmaSemanaOutraOrdem, config)).toEqual({});
    expect(buildRoutineUpdateInput(comSabado, config)).toEqual({
      workDays: [1, 2, 3, 4, 5, 6],
    });
  });

  it("trata o toggle de remarcação como mudança quando vira false", () => {
    const form = { ...buildRoutineForm(config), isRescheduleSameWeek: false };

    expect(buildRoutineUpdateInput(form, config)).toEqual({
      isRescheduleSameWeek: false,
    });
  });

  it("aceita zero tentativas de remarcação", () => {
    const form = { ...buildRoutineForm(config), maxRescheduleAttempts: 0 };

    expect(buildRoutineUpdateInput(form, config)).toEqual({
      maxRescheduleAttempts: 0,
    });
  });

  it("nunca inclui os pesos do score, que este formulário não mostra", () => {
    const form = {
      ...buildRoutineForm(config),
      workStartTime: "07:00:00",
      workEndTime: "17:00:00",
      avgVisitDurationMin: 45,
    };

    const input = buildRoutineUpdateInput(form, config);

    expect(input).toEqual({
      workStartTime: "07:00:00",
      workEndTime: "17:00:00",
      avgVisitDurationMin: 45,
    });
    expect(input).not.toHaveProperty("priorityWeights");
    expect(input).not.toHaveProperty("penaltyScorePerMiss");
  });
});
