export type PriorityWeights = Record<string, number>;

export interface ScheduleConfigSeller {
  id: string;
  user: {
    name: string;
  } | null;
}

export interface ScheduleConfig {
  id: string;
  sellerId: string;
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  avgVisitDurationMin: number;
  rescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
  seller: ScheduleConfigSeller | null;
}

export interface VisitScheduleConfigsResponse {
  schedule_configs: {
    edges: { node: ScheduleConfig }[];
    totalCount: number;
  };
}

export interface UpdateScheduleConfigInput {
  maxVisitsPerDay?: number;
  workDays?: number[];
  workStartTime?: string;
  workEndTime?: string;
  avgVisitDurationMin?: number;
  rescheduleSameWeek?: boolean;
  maxRescheduleAttempts?: number;
  penaltyScorePerMiss?: string;
  priorityWeights?: PriorityWeights;
}

export interface UpdateScheduleConfigResponse {
  updateScheduleConfig: {
    status: boolean;
    message: string;
    data: ScheduleConfig | null;
  };
}

export interface SettingsFormState {
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  avgVisitDurationMin: number;
  rescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
}
