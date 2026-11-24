"use client";

import { CheckCircle2, FileText } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Progress } from "@/components/Progress";
import { QueryError } from "@/components/QueryError";
import { formatDate } from "@/utils/format/date";
import { PAGE_HEADING } from "@/utils/modules";

import { ImportSellersModal } from "../_components/ImportSellersModal";
import { CompleteSetupCard } from "./_components/CompleteSetupCard";
import { SetupFactoryList } from "./_components/SetupFactoryList";
import { SetupStepCard } from "./_components/SetupStepCard";
import { useCompanySetup } from "./useCompanySetup";
import { SETUP_STEP_CONTENT, blockingStep, stepSummary } from "./utils";

function SetupSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-busy="true">
      <Loading.Skeleton className="h-[40px] w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <Loading.Skeleton key={i} className="h-[120px] w-full" />
      ))}
    </div>
  );
}

export default function ImportSettingsContent() {
  const { progress, loading, error, refetch, complete, isCompleting } =
    useCompanySetup();

  const steps = progress?.steps ?? [];
  // O próximo a fazer: o primeiro obrigatório pendente; sem nenhum, o
  // primeiro opcional pendente.
  const nextKey =
    steps.find((s) => !s.isDone && s.isRequired)?.key ??
    steps.find((s) => !s.isDone)?.key;

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.import}>
              Configuração inicial
            </PanelHeader.Heading>
            <PanelHeader.Description>
              Monte a empresa passo a passo, nesta ordem: cada passo prepara o
              que o próximo precisa.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !progress ? (
        <QueryError onRetry={() => refetch()} />
      ) : !progress ? (
        loading ? (
          <SetupSkeleton />
        ) : null
      ) : (
        <div className="flex flex-col gap-12">
          {progress.isCompleted ? (
            <Alert.Root variant="success">
              <Alert.Icon icon={CheckCircle2} />
              <Alert.Content>
                <Alert.Title>Configuração concluída</Alert.Title>
                <Alert.Description>
                  {progress.completedAt
                    ? `Concluída em ${formatDate(progress.completedAt)}. `
                    : ""}
                  Os passos continuam aqui para quando precisar trazer mais
                  dados.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : (
            <Progress.Root>
              <Progress.Header>
                <Progress.Label>Progresso</Progress.Label>
                <Progress.Value color="amber">
                  {progress.doneStepsCount} de {steps.length} passos
                </Progress.Value>
              </Progress.Header>
              <Progress.Bar
                value={
                  steps.length
                    ? (progress.doneStepsCount / steps.length) * 100
                    : 0
                }
                color="amber"
                label={`Progresso: ${progress.doneStepsCount} de ${steps.length} passos`}
              />
            </Progress.Root>
          )}

          {steps.map((step, index) => {
            const blocker = blockingStep(steps, index);
            return (
              <SetupStepCard
                key={step.key}
                number={index + 1}
                step={step}
                content={SETUP_STEP_CONTENT[step.key]}
                summary={stepSummary(step.key, progress)}
                isNext={!progress.isCompleted && step.key === nextKey}
                collapsed={progress.isCompleted && step.isDone && !blocker}
                blockedBy={
                  blocker
                    ? {
                        number: steps.findIndex((s) => s.key === blocker) + 1,
                        title: SETUP_STEP_CONTENT[blocker].title,
                      }
                    : null
                }
                extraAction={
                  step.key === "SELLERS" ? (
                    <ImportSellersModal onImported={() => refetch()} />
                  ) : step.key === "ORDER_HISTORY" && !blocker ? (
                    <Button.Link
                      href="/settings/import/pdfs"
                      appearance="outline"
                      color="neutral"
                      size="sm"
                    >
                      <Button.Icon icon={FileText} />
                      <Button.Title>Importar PDFs</Button.Title>
                    </Button.Link>
                  ) : undefined
                }
              >
                {step.key === "FACTORIES" && !blocker && (
                  <SetupFactoryList factories={progress.factories} />
                )}
              </SetupStepCard>
            );
          })}

          {!progress.isCompleted && (
            <CompleteSetupCard
              progress={progress}
              onComplete={complete}
              isCompleting={isCompleting}
            />
          )}
        </div>
      )}
    </PageContent>
  );
}
