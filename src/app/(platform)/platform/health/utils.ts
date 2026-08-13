import {
  JobHistory,
  JobRun,
  OperationHealth,
  RegressionKind,
} from "./interface";

export const JOB_STATUS_LABEL: Record<string, string> = {
  RUNNING: "Em execução",
  SUCCESS: "Concluído",
  FAILED: "Falhou",
  SKIPPED: "Pulado",
};

/** Quanto tempo um job pode ficar "em execução" antes de ser tratado como
 * travado. Os jobs da madrugada terminam em minutos; seis horas é folga
 * suficiente para não acusar falso positivo e curta o bastante para o alerta
 * aparecer no mesmo dia. */
const STUCK_HOURS = 6;

export type JobTone = "ok" | "atencao" | "urgente";

/**
 * O tom de uma execução.
 *
 * `RUNNING` merece atenção especial: um job que morreu no meio nunca grava
 * `FAILED` — ele simplesmente fica parado nesse estado. Sem o corte por tempo,
 * o pior caso (processo derrubado) apareceria como o mais tranquilo.
 */
export const jobTone = (job: JobRun, now: Date = new Date()): JobTone => {
  if (job.status === "FAILED") return "urgente";
  if (job.status === "RUNNING") {
    const started = new Date(job.startedAt);
    if (Number.isNaN(started.getTime())) return "atencao";
    const hours = (now.getTime() - started.getTime()) / 3_600_000;
    return hours > STUCK_HOURS ? "urgente" : "atencao";
  }
  // Pulado não é sucesso: o job acordou e não trabalhou. Uma vez é normal (duas
  // instâncias acordando juntas); é a repetição que denuncia lock preso, e essa
  // leitura mora no histórico, não numa execução isolada.
  if (job.status === "SKIPPED") return "atencao";
  return "ok";
};

/**
 * A partir de quanto uma piora de duração merece ser mostrada.
 *
 * Job noturno oscila com o volume da noite; só o crescimento grande diz alguma
 * coisa. Metade a mais que o normal é o corte: abaixo disso, a lista viveria
 * apontando variação de carga.
 */
export const SLOWER_JOB_PERCENT = 50;

/**
 * O tom de um job olhando o HISTÓRICO, não a última execução.
 *
 * A diferença importa: um job que falhou ontem e rodou hoje aparece verde na
 * foto e continua sendo um job que falha. E um job que só é pulado nunca
 * trabalha, ainda que nenhuma execução tenha "falhado".
 */
export const historyTone = (history: JobHistory): JobTone => {
  if (history.failures > 0) return "urgente";
  if (history.runs > 0 && history.skipped === history.runs) return "urgente";
  if (history.skipped > 0) return "atencao";
  if ((history.durationChange ?? 0) >= SLOWER_JOB_PERCENT) return "atencao";
  return "ok";
};

/** Duração em texto. Job se mede em segundos e minutos, não em milissegundos. */
export const formatDuration = (ms: number | null): string => {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}min`;
};

export const REGRESSION_LABEL: Record<RegressionKind, string> = {
  SLOWER: "Ficou mais lenta",
  FAILING: "Passou a falhar",
  BOTH: "Lenta e falhando",
};

export const REGRESSION_COLOR: Record<RegressionKind, "red" | "amber"> = {
  SLOWER: "amber",
  FAILING: "red",
  BOTH: "red",
};

/** A variação com sinal. `null` (sem base) vira "—" e não "0%": zero afirmaria
 * estabilidade onde não há o que comparar. */
export const formatDelta = (percent: number | null): string => {
  if (percent === null) return "—";
  const rounded = Math.round(percent);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

export const formatMoment = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** A partir daqui a demora é sentida por quem está do outro lado da tela. É o
 * mesmo corte que o backend usa para contar as operações lentas. */
export const SLOW_P95_MS = 1000;

/**
 * O tom de uma operação.
 *
 * Falha vem antes de lentidão, e por isso é testada primeiro: uma operação que
 * falha não entrega resultado nenhum, enquanto a lenta ainda entrega. Recusa
 * esperada não muda o tom — senha errada não é problema da plataforma.
 */
export const operationTone = (row: OperationHealth): JobTone => {
  if (row.errors > 0) return "urgente";
  if (row.p95Ms >= SLOW_P95_MS) return "atencao";
  return "ok";
};

/** Fatia das chamadas que falhou por defeito, de 0 a 100. */
export const failureRate = (row: OperationHealth): number =>
  row.total > 0 ? Math.round((row.errors / row.total) * 100) : 0;

/**
 * Duração em texto. Acima de um segundo passa a segundos: 2400ms é mais difícil
 * de ler que 2,4s, e é justamente na faixa lenta que o número importa.
 */
export const formatMs = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
