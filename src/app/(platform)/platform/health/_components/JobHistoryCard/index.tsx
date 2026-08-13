"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { History } from "lucide-react";
import { JobHistory } from "../../interface";
import {
  JOB_STATUS_LABEL,
  SLOWER_JOB_PERCENT,
  formatDelta,
  formatDuration,
  formatMoment,
  historyTone,
} from "../../utils";
import { RunStrip } from "./RunStrip";

const TONE_COLOR = { ok: "green", atencao: "amber", urgente: "red" } as const;

/**
 * Os jobs ao longo das últimas duas semanas.
 *
 * A lista de "última execução" responde se rodou hoje. Só isto responde para
 * onde está indo: um job que passou de dois para vinte minutos continua verde
 * naquela lista até o dia em que estoura o prazo do agendador — e aí a primeira
 * notícia é o job não rodando mais.
 *
 * Duas semanas, e não uma, porque o job de rotinas roda só às segundas: com
 * sete dias ele apareceria uma vez só e não formaria série nenhuma.
 */
export function JobHistoryCard({ history }: { history: JobHistory[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Jobs nas últimas duas semanas
        </Card.Header.Title>
        <Card.Header.Description>
          Quantas vezes cada job rodou, quantas falhou e se vem demorando mais
          que o normal.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {history.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <History size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>
              Nenhuma execução registrada ainda
            </EmptyState.Title>
            {/* Vazio aqui é ausência de informação, não saúde: a série começa a
                existir na primeira madrugada depois do deploy. */}
            <EmptyState.Description>
              Os jobs passam a gravar o próprio histórico a partir da próxima
              execução. Até lá, esta lista fica vazia mesmo com tudo rodando.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <ul className="flex flex-col gap-16">
            {history.map((job) => {
              const tone = historyTone(job);
              const slower = (job.durationChange ?? 0) >= SLOWER_JOB_PERCENT;

              return (
                <li
                  key={job.jobName}
                  className="flex flex-col gap-8 border-b border-(--border) pb-16 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-8">
                    <div className="flex flex-wrap items-center gap-8">
                      <Title variant="body-sm" weight="semibold">
                        {job.jobName}
                      </Title>
                      <Badge.Root
                        color={TONE_COLOR[tone]}
                        appearance="tinted"
                        size="xs"
                      >
                        <Badge.Text>
                          {JOB_STATUS_LABEL[job.lastStatus] ?? job.lastStatus}
                        </Badge.Text>
                      </Badge.Root>
                      {job.failures > 0 && (
                        <Title variant="micro" color="red">
                          {job.failures} de {job.runs} falharam
                        </Title>
                      )}
                      {job.skipped > 0 && (
                        <Title variant="micro" color="amber">
                          {job.skipped} pulados por lock ocupado
                        </Title>
                      )}
                    </div>

                    <Title variant="micro" color="muted">
                      última: {formatMoment(job.lastStartedAt)}
                    </Title>
                  </div>

                  {job.lastErrorMessage && (
                    <Title variant="micro" color="red">
                      {job.lastErrorMessage}
                    </Title>
                  )}

                  <RunStrip runs={job.series} />

                  <div className="flex flex-wrap items-baseline gap-16">
                    <Title variant="micro" color="muted">
                      típico {formatDuration(job.medianDurationMs)} · última{" "}
                      {formatDuration(job.lastDurationMs)}
                    </Title>
                    {slower && (
                      <Title variant="micro" color="amber">
                        {formatDelta(job.durationChange)} acima do normal — job
                        engordando
                      </Title>
                    )}
                    {job.lastSuccessAt === null && (
                      <Title variant="micro" color="red">
                        Nenhuma execução concluída no período
                      </Title>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card.Body>
    </Card.Root>
  );
}
