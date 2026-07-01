"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { Info, Save, Settings } from "lucide-react";

import { RoutineSkeleton } from "./_components/RoutineSkeleton";
import { ScoreWeightsCard } from "../_components/ScoreWeightsCard";
import { SchedulingPreferencesCard } from "../_components/SchedulingPreferencesCard";
import { WorkingParametersCard } from "../_components/WorkingParametersCard";
import { useRoutineSettings } from "./useRoutineSettings";

function RoutineActionBar({
  sellerName,
  canSave,
  isSaving,
  onSave,
}: {
  sellerName: string | null;
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-16 flex flex-col gap-12">
      <div>
        <Title variant="heading-sm">
          Configuração de rotina{sellerName ? ` · ${sellerName}` : ""}
        </Title>
        <Title variant="body" color="muted">
          Parâmetros de geração automática de rotina de visitas.
        </Title>
      </div>
      <Button.Root
        appearance="solid"
        color="amber"
        size="sm"
        className="desktop:w-auto w-full"
        disabled={!canSave || isSaving}
        loading={isSaving}
        onClick={onSave}
      >
        <Button.Icon icon={Save} />
        <Button.Title>Salvar configurações</Button.Title>
      </Button.Root>
    </div>
  );
}

export default function RoutineSettingsContent() {
  const {
    config,
    form,
    loading,
    isDirty,
    isLoading,
    handlePatch,
    handleWeightsChange,
    handleSave,
  } = useRoutineSettings();

  if (loading && !config) {
    return <RoutineSkeleton />;
  }

  if (!config || !form) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Settings />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhuma configuração de rotina</EmptyState.Title>
        <EmptyState.Description>
          Ainda não há uma configuração de geração automática para a empresa.
          Cadastre um vendedor primeiro para iniciar a configuração da rotina.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <div className="flex flex-col gap-20">
      <RoutineActionBar
        sellerName={config.seller?.user?.name ?? null}
        canSave={isDirty}
        isSaving={isLoading}
        onSave={handleSave}
      />

      <Alert.Root variant="info">
        <Alert.Icon icon={Info} />
        <Alert.Content>
          <Alert.Title>Alterações aplicadas na próxima geração</Alert.Title>
          <Alert.Description>
            Modificações aqui afetam apenas rotinas geradas a partir de agora.
            Rotinas já confirmadas não são alteradas.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Grid.Root
        cols={{ base: 1, desktop: 2 }}
        gap={16}
        data-tour="routine-params"
      >
        <WorkingParametersCard form={form} onChange={handlePatch} />
        <SchedulingPreferencesCard form={form} onChange={handlePatch} />
      </Grid.Root>

      <div data-tour="routine-score-weights">
        <ScoreWeightsCard
          weights={form.priorityWeights}
          onChange={handleWeightsChange}
        />
      </div>
    </div>
  );
}
