import { useAsyncAction } from "@/hooks/useAsyncAction";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  CREATE_SCHEDULE_CONFIG_MUTATION,
  ROUTINE_CONFIG_SELLERS_QUERY,
  UPDATE_SCHEDULE_CONFIG_MUTATION,
  VISIT_SCHEDULE_CONFIGS_QUERY,
} from "../gql";
import {
  CreateScheduleConfigResponse,
  RoutineConfigSeller,
  RoutineConfigSellersResponse,
  ScheduleConfig,
  SettingsFormState,
  UpdateScheduleConfigResponse,
  VisitScheduleConfigsResponse,
} from "../interface";
import {
  buildCreateInput,
  buildInitialFormState,
  buildUpdateInput,
  DEFAULT_CONFIG_FORM,
} from "../utils";

// Papéis que enxergam/editam a rotina de qualquer vendedor e escolhem de quem.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export function useRoutineSettings() {
  // Lido após o mount (cookie é client-only) para evitar mismatch de hidratação.
  const [canSelectSeller, setCanSelectSeller] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectSeller(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  // Gestor: lista de vendedores para o seletor. Vendedor comum não precisa.
  const { data: sellersData, loading: sellersLoading } =
    useQuery<RoutineConfigSellersResponse>(ROUTINE_CONFIG_SELLERS_QUERY, {
      variables: { input: { first: 200 } },
      skip: !canSelectSeller,
    });

  const sellers: RoutineConfigSeller[] = useMemo(
    () => sellersData?.config_sellers.edges.map((e) => e.node) ?? [],
    [sellersData]
  );

  // Todas as configs que o usuário pode ver (gestor: da empresa; vendedor: a sua).
  const {
    data,
    loading: configsLoading,
    refetch: refetchConfigs,
  } = useQuery<VisitScheduleConfigsResponse>(VISIT_SCHEDULE_CONFIGS_QUERY, {
    variables: {
      input: { first: 200, order: { by: "created_at", dir: "asc" } },
    },
  });

  const configs: ScheduleConfig[] = useMemo(
    () => data?.schedule_configs.edges.map((e) => e.node) ?? [],
    [data]
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Default do vendedor selecionado: primeiro da lista (gestor) ou o dono da
  // única config retornada (vendedor comum vê só a própria).
  useEffect(() => {
    if (selectedSellerId) return;
    if (canSelectSeller && sellers.length > 0) {
      setSelectedSellerId(sellers[0].id);
    } else if (!canSelectSeller && configs.length > 0) {
      setSelectedSellerId(configs[0].sellerId);
    }
  }, [canSelectSeller, sellers, configs, selectedSellerId]);

  const config = useMemo(
    () => configs.find((c) => c.sellerId === selectedSellerId),
    [configs, selectedSellerId]
  );

  const [form, setForm] = useState<SettingsFormState | null>(null);

  // Ao trocar de vendedor/carregar: form vem da config existente ou dos padrões
  // (quando o vendedor ainda não tem configuração).
  useEffect(() => {
    if (!selectedSellerId) {
      setForm(null);
      return;
    }
    setForm(
      config ? buildInitialFormState(config) : { ...DEFAULT_CONFIG_FORM }
    );
  }, [config, selectedSellerId]);

  const [updateConfig] = useMutation<UpdateScheduleConfigResponse>(
    UPDATE_SCHEDULE_CONFIG_MUTATION
  );
  const [createConfig] = useMutation<CreateScheduleConfigResponse>(
    CREATE_SCHEDULE_CONFIG_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Vendedor sem configuração ainda: o gestor cria a partir dos padrões.
  const isNewConfig = !!selectedSellerId && !config;

  const updateInput = config && form ? buildUpdateInput(form, config) : {};
  const isDirty = isNewConfig ? true : Object.keys(updateInput).length > 0;

  const handlePatch = (patch: Partial<SettingsFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!form || !selectedSellerId) return;

    if (isNewConfig) {
      await execute(
        async () => {
          const res = await createConfig({
            variables: { input: buildCreateInput(form, selectedSellerId) },
          });
          if (
            !res.data?.createScheduleConfig?.status ||
            !res.data.createScheduleConfig.data
          ) {
            throw new Error(
              res.data?.createScheduleConfig?.message ?? "Erro ao criar"
            );
          }
          return res.data.createScheduleConfig.data;
        },
        {
          successMessage: "Configuração criada com sucesso",
          onSuccess: async () => {
            // Recarrega a lista: a nova config aparece, isNewConfig vira false
            // e o botão passa de "Criar configuração" para "Salvar configurações".
            await refetchConfigs();
          },
        }
      );
      return;
    }

    if (!config || !isDirty) return;
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
          // Recarrega a lista para refletir a nova/atualizada config: o alias
          // `schedule_configs` não bate com o campo do cache, por isso refetch.
          await refetchConfigs();
        },
      }
    );
  };

  const selectedSellerName =
    config?.seller?.user?.name ??
    sellers.find((s) => s.id === selectedSellerId)?.name ??
    null;

  return {
    canSelectSeller,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    selectedSellerName,
    config,
    form,
    isNewConfig,
    loading: configsLoading || (canSelectSeller && sellersLoading),
    hasNoSellers: canSelectSeller && !sellersLoading && sellers.length === 0,
    isDirty,
    isLoading,
    handlePatch,
    handleSave,
  };
}
