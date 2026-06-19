import {
  PriorityWeights,
  ScheduleConfig,
  SettingsFormState,
  UpdateScheduleConfigInput,
} from "./interface";

export const WEEKDAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
] as const;

export type WeightColor = "red" | "amber" | "blue" | "green" | "cyan";

export interface WeightDefinition {
  key: string;
  label: string;
  color: WeightColor;
  defaultValue: number;
}

export const WEIGHT_DEFINITIONS: WeightDefinition[] = [
  { key: "urgency", label: "Urgência de estoque", color: "red", defaultValue: 30 },
  { key: "priority", label: "Prioridade do cliente", color: "amber", defaultValue: 20 },
  { key: "frequency", label: "Frequência de visita", color: "blue", defaultValue: 25 },
  { key: "potential", label: "Potencial de compra", color: "green", defaultValue: 15 },
  { key: "recency", label: "Recência da visita", color: "cyan", defaultValue: 10 },
];

export const buildInitialFormState = (
  config: ScheduleConfig
): SettingsFormState => ({
  maxVisitsPerDay: config.maxVisitsPerDay,
  workDays: [...config.workDays],
  workStartTime: config.workStartTime,
  workEndTime: config.workEndTime,
  avgVisitDurationMin: config.avgVisitDurationMin,
  rescheduleSameWeek: config.rescheduleSameWeek,
  maxRescheduleAttempts: config.maxRescheduleAttempts,
  penaltyScorePerMiss: config.penaltyScorePerMiss,
  priorityWeights: { ...(config.priorityWeights ?? {}) },
});

const arraysEqual = (a: number[], b: number[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
};

const weightsEqual = (a: PriorityWeights, b: PriorityWeights): boolean => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (Number(a[key] ?? 0) !== Number(b[key] ?? 0)) return false;
  }
  return true;
};

export const buildUpdateInput = (
  form: SettingsFormState,
  config: ScheduleConfig
): UpdateScheduleConfigInput => {
  const input: UpdateScheduleConfigInput = {};

  if (form.maxVisitsPerDay !== config.maxVisitsPerDay) {
    input.maxVisitsPerDay = form.maxVisitsPerDay;
  }
  if (!arraysEqual(form.workDays, config.workDays)) {
    input.workDays = form.workDays;
  }
  if (form.workStartTime !== config.workStartTime) {
    input.workStartTime = form.workStartTime;
  }
  if (form.workEndTime !== config.workEndTime) {
    input.workEndTime = form.workEndTime;
  }
  if (form.avgVisitDurationMin !== config.avgVisitDurationMin) {
    input.avgVisitDurationMin = form.avgVisitDurationMin;
  }
  if (form.rescheduleSameWeek !== config.rescheduleSameWeek) {
    input.rescheduleSameWeek = form.rescheduleSameWeek;
  }
  if (form.maxRescheduleAttempts !== config.maxRescheduleAttempts) {
    input.maxRescheduleAttempts = form.maxRescheduleAttempts;
  }
  if (form.penaltyScorePerMiss !== config.penaltyScorePerMiss) {
    input.penaltyScorePerMiss = form.penaltyScorePerMiss;
  }
  if (!weightsEqual(form.priorityWeights, config.priorityWeights ?? {})) {
    input.priorityWeights = form.priorityWeights;
  }

  return input;
};

export const totalWeight = (weights: PriorityWeights): number =>
  Object.values(weights).reduce((sum, v) => sum + Number(v ?? 0), 0);
