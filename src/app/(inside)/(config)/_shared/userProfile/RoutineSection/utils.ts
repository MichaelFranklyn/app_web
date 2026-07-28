import {
  RoutineOperationalForm,
  UpdateScheduleConfigInput,
} from "./routineConfig";
import { ProfileScheduleConfig } from "../interface";

/** Form do card a partir da config que veio no perfil. */
export const buildRoutineForm = (
  config: ProfileScheduleConfig
): RoutineOperationalForm => ({
  maxVisitsPerDay: config.maxVisitsPerDay,
  workDays: [...config.workDays],
  workStartTime: config.workStartTime,
  workEndTime: config.workEndTime,
  isRemoteContactEnabled: config.isRemoteContactEnabled,
  maxRemoteContactsPerDay: config.maxRemoteContactsPerDay,
  remoteContactIntervalPct: config.remoteContactIntervalPct,
  avgVisitDurationMin: config.avgVisitDurationMin,
  isRescheduleSameWeek: config.isRescheduleSameWeek,
  maxRescheduleAttempts: config.maxRescheduleAttempts,
});

const sameDays = (a: number[], b: number[]): boolean =>
  a.length === b.length &&
  [...a].sort().every((v, i) => v === [...b].sort()[i]);

/**
 * Só o que mudou vai para a mutation. Compara contra os campos que o perfil
 * carrega — os pesos do score não passam por aqui, então não corre o risco de
 * serem sobrescritos por um formulário que nem os mostra.
 */
export const buildRoutineUpdateInput = (
  form: RoutineOperationalForm,
  config: ProfileScheduleConfig
): UpdateScheduleConfigInput => {
  const input: UpdateScheduleConfigInput = {};

  if (form.maxVisitsPerDay !== config.maxVisitsPerDay) {
    input.maxVisitsPerDay = form.maxVisitsPerDay;
  }
  if (!sameDays(form.workDays, config.workDays)) {
    input.workDays = form.workDays;
  }
  if (form.workStartTime !== config.workStartTime) {
    input.workStartTime = form.workStartTime;
  }
  if (form.workEndTime !== config.workEndTime) {
    input.workEndTime = form.workEndTime;
  }
  if (form.isRemoteContactEnabled !== config.isRemoteContactEnabled) {
    input.isRemoteContactEnabled = form.isRemoteContactEnabled;
  }
  if (form.maxRemoteContactsPerDay !== config.maxRemoteContactsPerDay) {
    input.maxRemoteContactsPerDay = form.maxRemoteContactsPerDay;
  }
  if (form.remoteContactIntervalPct !== config.remoteContactIntervalPct) {
    input.remoteContactIntervalPct = form.remoteContactIntervalPct;
  }
  if (form.avgVisitDurationMin !== config.avgVisitDurationMin) {
    input.avgVisitDurationMin = form.avgVisitDurationMin;
  }
  if (form.isRescheduleSameWeek !== config.isRescheduleSameWeek) {
    input.isRescheduleSameWeek = form.isRescheduleSameWeek;
  }
  if (form.maxRescheduleAttempts !== config.maxRescheduleAttempts) {
    input.maxRescheduleAttempts = form.maxRescheduleAttempts;
  }

  return input;
};
