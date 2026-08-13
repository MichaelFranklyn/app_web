import { describe, expect, it } from "vitest";
import { JobHistory, JobRun, OperationHealth } from "./interface";
import {
  SLOW_P95_MS,
  failureRate,
  formatDelta,
  formatDuration,
  formatMs,
  historyTone,
  jobTone,
  operationTone,
} from "./utils";

const NOW = new Date("2026-08-12T10:00:00Z");

const job = (partial: Partial<JobRun>): JobRun =>
  ({
    jobName: "girus-daily",
    startedAt: "2026-08-12T04:00:00Z",
    finishedAt: null,
    status: "SUCCESS",
    errorMessage: null,
    ...partial,
  }) as JobRun;

describe("jobTone", () => {
  it("concluído é ok", () => {
    expect(jobTone(job({ status: "SUCCESS" }), NOW)).toBe("ok");
  });

  it("falhou é urgente", () => {
    expect(jobTone(job({ status: "FAILED" }), NOW)).toBe("urgente");
  });

  it("rodando há pouco é só atenção", () => {
    expect(
      jobTone(
        job({ status: "RUNNING", startedAt: "2026-08-12T09:30:00Z" }),
        NOW
      )
    ).toBe("atencao");
  });

  it("rodando há muito tempo é job travado, não job trabalhando", () => {
    // Processo derrubado no meio nunca grava FAILED — fica parado em RUNNING.
    // Sem o corte por tempo, o pior caso pareceria o mais tranquilo.
    expect(
      jobTone(
        job({ status: "RUNNING", startedAt: "2026-08-11T20:00:00Z" }),
        NOW
      )
    ).toBe("urgente");
  });

  it("data de início inválida não vira ok silencioso", () => {
    expect(jobTone(job({ status: "RUNNING", startedAt: "nada" }), NOW)).toBe(
      "atencao"
    );
  });
});

const operation = (partial: Partial<OperationHealth>): OperationHealth => ({
  operation: "createOrder",
  total: 100,
  errors: 0,
  rejections: 0,
  medianMs: 40,
  p95Ms: 120,
  maxMs: 300,
  lastErrorAt: null,
  lastErrorMessage: null,
  ...partial,
});

describe("jobTone (pulado)", () => {
  it("pulado não é sucesso", () => {
    // O job acordou e não trabalhou. Verde ali diria que o trabalho aconteceu.
    expect(jobTone(job({ status: "SKIPPED" }), NOW)).toBe("atencao");
  });
});

describe("operationTone", () => {
  it("falha ganha de lentidão", () => {
    // A lenta ainda entrega resultado; a que falha não entrega nada.
    expect(operationTone(operation({ errors: 1, p95Ms: 50 }))).toBe("urgente");
  });

  it("lenta sem falha é atenção, não urgência", () => {
    expect(operationTone(operation({ p95Ms: SLOW_P95_MS }))).toBe("atencao");
  });

  it("recusa esperada não muda o tom", () => {
    // É o caso do login: senha errada o dia inteiro, nada quebrado.
    expect(operationTone(operation({ rejections: 300 }))).toBe("ok");
  });
});

describe("failureRate", () => {
  it("fatia das chamadas que falhou", () => {
    expect(failureRate(operation({ total: 200, errors: 10 }))).toBe(5);
  });

  it("sem chamada alguma é zero, não NaN", () => {
    expect(failureRate(operation({ total: 0, errors: 0 }))).toBe(0);
  });

  it("ignora a recusa no cálculo", () => {
    // 50 recusas em 100 chamadas não são meio sistema quebrado.
    expect(
      failureRate(operation({ total: 100, errors: 0, rejections: 50 }))
    ).toBe(0);
  });
});

describe("formatMs", () => {
  it("abaixo de um segundo fica em ms", () => {
    expect(formatMs(240)).toBe("240ms");
  });

  it("a partir de um segundo vira segundos", () => {
    expect(formatMs(2400)).toBe("2.4s");
  });
});

const history = (partial: Partial<JobHistory>): JobHistory =>
  ({
    jobName: "girus-visit-scores",
    runs: 14,
    failures: 0,
    skipped: 0,
    lastStatus: "SUCCESS",
    lastStartedAt: "2026-08-12T04:00:00Z",
    lastSuccessAt: "2026-08-12T04:00:00Z",
    lastErrorMessage: null,
    medianDurationMs: 60_000,
    lastDurationMs: 60_000,
    durationChange: 0,
    series: [],
    ...partial,
  }) as JobHistory;

describe("historyTone", () => {
  it("qualquer falha na janela é urgente", () => {
    // A foto da última execução mostraria verde: o job falhou ontem e rodou
    // hoje. Continua sendo um job que falha.
    expect(historyTone(history({ failures: 1, lastStatus: "SUCCESS" }))).toBe(
      "urgente"
    );
  });

  it("todas as execuções puladas é lock preso", () => {
    // Nenhuma falhou, e mesmo assim o trabalho nunca aconteceu.
    expect(historyTone(history({ runs: 14, skipped: 14 }))).toBe("urgente");
  });

  it("alguns pulos são só atenção", () => {
    expect(historyTone(history({ runs: 14, skipped: 2 }))).toBe("atencao");
  });

  it("job engordando merece atenção antes de falhar", () => {
    expect(historyTone(history({ durationChange: 80 }))).toBe("atencao");
  });

  it("variação pequena de duração é oscilação de carga", () => {
    expect(historyTone(history({ durationChange: 20 }))).toBe("ok");
  });
});

describe("formatDuration", () => {
  it.each([
    [null, "—"],
    [340, "340ms"],
    [2400, "2.4s"],
    [125_000, "2min"],
  ])("%s → %s", (ms, expected) => {
    expect(formatDuration(ms as number | null)).toBe(expected);
  });
});

describe("formatDelta", () => {
  it("alta ganha sinal", () => {
    expect(formatDelta(42.4)).toBe("+42%");
  });

  it("sem base de comparação não vira zero", () => {
    // Zero afirmaria estabilidade onde não existe o que comparar.
    expect(formatDelta(null)).toBe("—");
  });
});
