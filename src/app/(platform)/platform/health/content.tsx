"use client";

import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { JobHistoryCard } from "./_components/JobHistoryCard";
import { OperationHealthCard } from "./_components/OperationHealthCard";
import { OperationTrendCard } from "./_components/OperationTrendCard";
import {
  JOB_HISTORY_QUERY,
  OPERATION_HEALTH_QUERY,
  OPERATION_TREND_QUERY,
  PLATFORM_HEALTH_QUERY,
} from "./gql";
import {
  HealthContentProps,
  HealthQueryData,
  JobHistoryQueryData,
  OperationHealthQueryData,
  OperationTrendQueryData,
} from "./interface";
import {
  JOB_STATUS_LABEL,
  formatDuration,
  formatMoment,
  jobTone,
} from "./utils";

const TONE_COLOR = { ok: "green", atencao: "amber", urgente: "red" } as const;

export default function PlatformHealthContent({
  seed,
  seedOperations,
  seedTrend,
  seedJobs,
}: HealthContentProps) {
  useSeedQuery([
    { query: PLATFORM_HEALTH_QUERY, data: seed },
    { query: OPERATION_HEALTH_QUERY, data: seedOperations },
    { query: OPERATION_TREND_QUERY, data: seedTrend },
    { query: JOB_HISTORY_QUERY, data: seedJobs },
  ]);
  const { data, loading, error, refetch } = useQuery<HealthQueryData>(
    PLATFORM_HEALTH_QUERY,
    // Saúde é estado do momento: um cache quente aqui mostraria "tudo em
    // ordem" de dez minutos atrás justamente quando algo acabou de quebrar.
    { fetchPolicy: "cache-and-network" }
  );
  const operationsQuery = useQuery<OperationHealthQueryData>(
    OPERATION_HEALTH_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const trendQuery = useQuery<OperationTrendQueryData>(OPERATION_TREND_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const jobsQuery = useQuery<JobHistoryQueryData>(JOB_HISTORY_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const health = data?.platformHealth?.data ?? null;
  const report = operationsQuery.data?.platformOperationHealth?.data ?? null;
  const trend = trendQuery.data?.platformOperationTrend?.data ?? null;
  const jobs = jobsQuery.data?.platformJobHistory?.data ?? null;

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--purple)">
              Console
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>Saúde</PanelHeader.Title>
            <PanelHeader.Description>
              Estado técnico da plataforma: banco, jobs agendados e pendências.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !health ? (
        <QueryError onRetry={() => refetch()} />
      ) : !health ? (
        <>
          <Loading.Skeleton className="h-[120px] w-full" />
          <Loading.Skeleton className="h-[200px] w-full" />
        </>
      ) : (
        <>
          {health.hasPendingMigration && (
            <Alert.Root variant="error">
              <Alert.Icon icon={AlertTriangle} />
              <Alert.Content>
                <Alert.Title>Migration pendente</Alert.Title>
                <Alert.Description>
                  O banco está em <strong>{health.databaseRevision}</strong> e o
                  código em <strong>{health.codeRevision}</strong>. É a causa
                  clássica de erro de coluna inexistente logo depois de um
                  deploy — rode <code>alembic upgrade head</code>.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {health.expiredTrials > 0 && (
            <Alert.Root variant="warning">
              <Alert.Icon icon={Clock} />
              <Alert.Content>
                <Alert.Title>
                  {health.expiredTrials}{" "}
                  {health.expiredTrials === 1
                    ? "empresa com teste vencido"
                    : "empresas com testes vencidos"}
                </Alert.Title>
                <Alert.Description>
                  O login delas já é recusado, mas nenhuma decisão foi tomada.
                  Defina um plano ou suspenda formalmente.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <Grid.Root cols={{ base: 1, tablet: 3 }} gap={12}>
            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Revisão do banco</Card.Kpi.Label>
                <Card.Kpi.Value
                  status={health.hasPendingMigration ? "urgente" : "ok"}
                  className="text-[16px]!"
                >
                  {health.databaseRevision ?? "desconhecida"}
                </Card.Kpi.Value>
                <Card.Kpi.Delta>
                  código: {health.codeRevision ?? "desconhecida"}
                </Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>

            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Testes vencidos</Card.Kpi.Label>
                <Card.Kpi.Value
                  status={health.expiredTrials > 0 ? "atencao" : "ok"}
                >
                  {health.expiredTrials}
                </Card.Kpi.Value>
                <Card.Kpi.Delta>ativas com prazo no passado</Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>

            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Jobs monitorados</Card.Kpi.Label>
                <Card.Kpi.Value status="neutral">
                  {health.jobs.length}
                </Card.Kpi.Value>
                <Card.Kpi.Delta>
                  {loading ? "atualizando…" : "última execução de cada um"}
                </Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>

            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Operações falhando</Card.Kpi.Label>
                <Card.Kpi.Value status={report?.failing ? "urgente" : "ok"}>
                  {report?.failing ?? "—"}
                </Card.Kpi.Value>
                <Card.Kpi.Delta>defeito, não recusa esperada</Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>

            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Operações lentas</Card.Kpi.Label>
                <Card.Kpi.Value status={report?.slow ? "atencao" : "ok"}>
                  {report?.slow ?? "—"}
                </Card.Kpi.Value>
                <Card.Kpi.Delta>p95 acima de 1s</Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>
          </Grid.Root>

          <Card.Root>
            <Card.Header>
              <Card.Header.Title size="sm" weight="semibold">
                Jobs agendados
              </Card.Header.Title>
              <Card.Header.Description>
                Última execução de cada job, registrada pelo próprio job.
              </Card.Header.Description>
            </Card.Header>

            <Card.Body>
              {health.jobs.length === 0 ? (
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CheckCircle2 size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma execução registrada
                  </EmptyState.Title>
                  {/* Vazio aqui é ausência de informação, não saúde: os jobs
                      rodam no Cloud Scheduler e só aparecem depois que
                      passarem a gravar em `platform_job_runs`. */}
                  <EmptyState.Description>
                    Os jobs ainda não gravam o próprio histórico. Até que
                    gravem, esta lista fica vazia mesmo com tudo rodando.
                  </EmptyState.Description>
                </EmptyState.Root>
              ) : (
                <ul className="flex flex-col gap-8">
                  {health.jobs.map((job) => {
                    const tone = jobTone(job);
                    return (
                      <li
                        key={job.jobName}
                        className="flex flex-wrap items-baseline justify-between gap-8 border-b border-(--border) pb-8 last:border-0"
                      >
                        <div className="flex flex-col gap-[2px]">
                          <Title variant="body-sm" weight="semibold">
                            {job.jobName}
                          </Title>
                          {job.errorMessage && (
                            <Title variant="micro" color="red">
                              {job.errorMessage}
                            </Title>
                          )}
                        </div>
                        <div className="flex items-baseline gap-8">
                          {/* A duração da última execução vem antes do horário:
                              é ela que muda com o tempo, e um job que dobrou de
                              duração é o aviso que antecede a falha. */}
                          <Title variant="micro" color="muted">
                            {formatDuration(job.durationMs)} ·{" "}
                            {formatMoment(job.startedAt)}
                          </Title>
                          <Title variant="caption" color={TONE_COLOR[tone]}>
                            {JOB_STATUS_LABEL[job.status] ?? job.status}
                          </Title>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card.Body>
          </Card.Root>

          {/* O histórico vem logo abaixo da foto: aquela responde "rodou hoje?",
              este responde "para onde está indo". */}
          {jobs ? (
            <JobHistoryCard history={jobs} />
          ) : (
            <Loading.Skeleton className="h-[240px] w-full" />
          )}

          {report ? (
            <OperationHealthCard report={report} />
          ) : (
            <Loading.Skeleton className="h-[280px] w-full" />
          )}

          {trend ? (
            <OperationTrendCard report={trend} />
          ) : (
            <Loading.Skeleton className="h-[400px] w-full" />
          )}
        </>
      )}
    </PageContent>
  );
}
