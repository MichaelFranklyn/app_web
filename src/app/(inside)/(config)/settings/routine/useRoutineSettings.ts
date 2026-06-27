import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

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

export function useRoutineSettings() {
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

  return {
    config,
    form,
    loading,
    isDirty,
    isLoading,
    handlePatch,
    handleWeightsChange,
    handleSave,
  };
}
