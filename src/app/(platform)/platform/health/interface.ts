export interface JobRun {
  jobName: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  errorMessage: string | null;
  /** Nulo enquanto não terminou — o estado de um job morto no meio. */
  durationMs: number | null;
}

export interface JobRunPoint {
  startedAt: string;
  status: string;
  durationMs: number | null;
}

export interface JobHistory {
  jobName: string;
  runs: number;
  failures: number;
  /** Execuções puladas por lock ocupado — todas puladas é lock preso. */
  skipped: number;
  lastStatus: string;
  lastStartedAt: string;
  lastSuccessAt: string | null;
  /** Mensagem da falha mais recente da JANELA — sobrevive ao job se recuperar. */
  lastErrorMessage: string | null;
  medianDurationMs: number | null;
  lastDurationMs: number | null;
  /** Distância da última execução até a mediana, em %. Job engordando. */
  durationChange: number | null;
  series: JobRunPoint[];
}

export interface JobHistoryQueryData {
  platformJobHistory: { data: JobHistory[] | null };
}

export type RegressionKind = "SLOWER" | "FAILING" | "BOTH";

export interface OperationRegression {
  operation: string;
  kind: RegressionKind;
  callsCurrent: number;
  callsPrevious: number;
  p95Current: number;
  p95Previous: number;
  /** Nulo quando não havia p95 anterior: sem base não existe variação. */
  p95Change: number | null;
  errorsCurrent: number;
  errorsPrevious: number;
  errorRateCurrent: number;
  errorRatePrevious: number;
  lastErrorMessage: string | null;
}

export interface OperationPulsePoint {
  day: string;
  calls: number;
  errors: number;
  p95Ms: number;
}

export interface OperationTrendReport {
  daily: OperationPulsePoint[];
  regressions: OperationRegression[];
  newOperations: string[];
  vanishedOperations: string[];
}

export interface OperationTrendQueryData {
  platformOperationTrend: { data: OperationTrendReport | null };
}

export interface PlatformHealth {
  databaseRevision: string | null;
  codeRevision: string | null;
  hasPendingMigration: boolean;
  expiredTrials: number;
  jobs: JobRun[];
}

export interface HealthQueryData {
  platformHealth: { data: PlatformHealth | null };
}

export interface OperationHealth {
  operation: string;
  total: number;
  /** Falhas do sistema (5xx ou erro sem código) — o que exige conserto. */
  errors: number;
  /** Recusas esperadas (4xx): senha errada, duplicidade, regra barrando. */
  rejections: number;
  medianMs: number;
  p95Ms: number;
  maxMs: number;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
}

export interface OperationHealthReport {
  operations: OperationHealth[];
  failing: number;
  slow: number;
}

export interface OperationHealthQueryData {
  platformOperationHealth: { data: OperationHealthReport | null };
}

export interface HealthContentProps {
  seed: HealthQueryData | null;
  seedOperations: OperationHealthQueryData | null;
  seedTrend: OperationTrendQueryData | null;
  seedJobs: JobHistoryQueryData | null;
}
