import {
  CreateScheduleConfigInput,
  RoutineOperationalForm,
  SettingsFormState,
} from "./interface";

// Valores padrão de uma nova configuração de rotina. Espelham
// DEFAULT_MAX_VISITS_PER_DAY e DEFAULT_VISIT_DURATION_MIN do backend
// (visit_schedule_configs/defaults.py): 3 visitas de 2h por dia é o que cabe na
// jornada de 8h–18h com o deslocamento por cima. Ficaram para trás em 8 × 30min
// — quem criasse a configuração por esta tela nascia com um dia impossível.
export const DEFAULT_CONFIG_FORM: SettingsFormState = {
  maxVisitsPerDay: 3,
  workDays: [1, 2, 3, 4, 5],
  workStartTime: "08:00:00",
  workEndTime: "18:00:00",
  isRemoteContactEnabled: true,
  maxRemoteContactsPerDay: 5,
  remoteContactIntervalPct: 50,
  avgVisitDurationMin: 120,
  isRescheduleSameWeek: true,
  maxRescheduleAttempts: 3,
  penaltyScorePerMiss: "1.0",
  priorityWeights: { recency: 1.0, urgency: 1.0, frequency: 1.0 },
};

export const WEEKDAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
] as const;

export const buildCreateInput = (
  form: SettingsFormState,
  sellerId: string
): CreateScheduleConfigInput => ({
  sellerId,
  maxVisitsPerDay: form.maxVisitsPerDay,
  workDays: form.workDays,
  workStartTime: form.workStartTime,
  workEndTime: form.workEndTime,
  isRemoteContactEnabled: form.isRemoteContactEnabled,
  maxRemoteContactsPerDay: form.maxRemoteContactsPerDay,
  remoteContactIntervalPct: form.remoteContactIntervalPct,
  avgVisitDurationMin: form.avgVisitDurationMin,
  isRescheduleSameWeek: form.isRescheduleSameWeek,
  maxRescheduleAttempts: form.maxRescheduleAttempts,
  penaltyScorePerMiss: form.penaltyScorePerMiss,
  priorityWeights: form.priorityWeights,
});

/** "08:00" a partir de "08:00:00" — o backend devolve Time com segundos. */
export const toTimeInputValue = (value: string): string => value.slice(0, 5);

/** "08:00" do input volta como "08:00:00" para o scalar Time. */
export const fromTimeInputValue = (value: string): string => `${value}:00`;

/** Liga/desliga um dia da semana mantendo a lista em ordem. */
export const toggleWorkDay = (days: number[], day: number): number[] =>
  (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]).sort(
    (a, b) => a - b
  );

/**
 * Cria a config que faltava a partir dos padrões, preservando o que a pessoa
 * acabou de preencher no card. Os pesos do score entram com o padrão — não há
 * tela que os edite.
 */
export const buildCreateInputFromOperational = (
  form: RoutineOperationalForm,
  sellerId: string
): CreateScheduleConfigInput =>
  buildCreateInput({ ...DEFAULT_CONFIG_FORM, ...form }, sellerId);
