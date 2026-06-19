"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { Info, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { RoutineSkeleton } from "./_components/RoutineSkeleton";
import { ScoreWeightsCard } from "../_components/ScoreWeightsCard";
import { SchedulingPreferencesCard } from "../_components/SchedulingPreferencesCard";
import { WorkingParametersCard } from "../_components/WorkingParametersCard";
import {
  UPDATE_SCHEDULE_CONFIG_MUTATION,
  VISIT_SCHEDULE_CONFIGS_QUERY,
} from "../gql";
import {
  PriorityWeights,
  ScheduleConfig,
  SettingsFormState,
  UpdateScheduleConfigResponse,
  VisitScheduleConfigsResponse,
} from "../interface";
import { buildInitialFormState, buildUpdateInput } from "../utils";

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
    <div className="flex items-start justify-between gap-16">
      <div>
        <h2 className="font-head text-[17px] font-bold text-(--text)">
          Configuração de rotina{sellerName ? ` · ${sellerName}` : ""}
        </h2>
        <Title variant="body" color="muted">
          Parâmetros de geração automática de rotina de visitas.
        </Title>
      </div>
      <Button.Root
        appearance="solid"
        color="amber"
        size="md"
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
  const { data, loading } = useQuery<VisitScheduleConfigsResponse>(
    VISIT_SCHEDULE_CONFIGS_QUERY,
    {
      variables: {
        input: {
          first: 1,
          order: { by: "created_at", dir: "asc" },
        },
      },
    }
  );

  const config: ScheduleConfig | undefined =
    data?.schedule_configs.edges[0]?.node;

  const [form, setForm] = useState<SettingsFormState | null>(null);

  useEffect(() => {
    if (config) setForm(buildInitialFormState(config));
  }, [config]);

  const invalidateClient = useInvalidateQueriesClient();
  const [updateConfig] = useMutation<UpdateScheduleConfigResponse>(
    UPDATE_SCHEDULE_CONFIG_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const updateInput = config && form ? buildUpdateInput(form, config) : {};
  const isDirty = Object.keys(updateInput).length > 0;

  const handlePatch = (patch: Partial<SettingsFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleWeightsChange = (weights: PriorityWeights) => {
    setForm((prev) => (prev ? { ...prev, priorityWeights: weights } : prev));
  };

  const handleSave = async () => {
    if (!config || !form || !isDirty) return;
    await execute(
      async () => {
        const res = await updateConfig({
          variables: { id: config.id, input: updateInput },
        });
        if (
          !res.data?.updateScheduleConfig?.status ||
          !res.data.updateScheduleConfig.data
        ) {
          throw new Error(
            res.data?.updateScheduleConfig?.message ?? "Erro ao salvar"
          );
        }
        return res.data.updateScheduleConfig.data;
      },
      {
        successMessage: "Configuração salva com sucesso",
        onSuccess: async () => {
          await invalidateClient(["schedule_configs"]);
        },
      }
    );
  };

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

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        <WorkingParametersCard form={form} onChange={handlePatch} />
        <SchedulingPreferencesCard form={form} onChange={handlePatch} />
      </Grid.Root>

      <ScoreWeightsCard
        weights={form.priorityWeights}
        onChange={handleWeightsChange}
      />
    </div>
  );
}
