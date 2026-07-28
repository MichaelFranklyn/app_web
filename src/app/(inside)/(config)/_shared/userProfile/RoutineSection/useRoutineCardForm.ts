"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";
import {
  buildCreateInputFromOperational,
  CREATE_SCHEDULE_CONFIG_MUTATION,
  CreateScheduleConfigResponse,
  DEFAULT_CONFIG_FORM,
  RoutineOperationalForm,
  UPDATE_SCHEDULE_CONFIG_MUTATION,
  UpdateScheduleConfigResponse,
} from "./routineConfig";
import { ProfileSeller } from "../interface";
import { buildRoutineForm, buildRoutineUpdateInput } from "./utils";

/** Padrões sem os pesos do score, que o card não edita. */
const DEFAULT_OPERATIONAL: RoutineOperationalForm = {
  maxVisitsPerDay: DEFAULT_CONFIG_FORM.maxVisitsPerDay,
  workDays: [...DEFAULT_CONFIG_FORM.workDays],
  workStartTime: DEFAULT_CONFIG_FORM.workStartTime,
  workEndTime: DEFAULT_CONFIG_FORM.workEndTime,
  isRemoteContactEnabled: DEFAULT_CONFIG_FORM.isRemoteContactEnabled,
  maxRemoteContactsPerDay: DEFAULT_CONFIG_FORM.maxRemoteContactsPerDay,
  remoteContactIntervalPct: DEFAULT_CONFIG_FORM.remoteContactIntervalPct,
  avgVisitDurationMin: DEFAULT_CONFIG_FORM.avgVisitDurationMin,
  isRescheduleSameWeek: DEFAULT_CONFIG_FORM.isRescheduleSameWeek,
  maxRescheduleAttempts: DEFAULT_CONFIG_FORM.maxRescheduleAttempts,
};

interface Params {
  seller: ProfileSeller;
  onSaved: () => void;
}

/**
 * Edição da rotina dentro do card: sem configuração ainda, o form nasce dos
 * padrões e o primeiro "Salvar" cria a config; com configuração, manda só o que
 * mudou.
 */
export function useRoutineCardForm({ seller, onSaved }: Params) {
  const config = seller.scheduleConfig;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<RoutineOperationalForm>(() =>
    config ? buildRoutineForm(config) : { ...DEFAULT_OPERATIONAL }
  );

  // Um refetch (ou a troca de vendedor) traz outra config: o form segue a fonte.
  useEffect(() => {
    setForm(config ? buildRoutineForm(config) : { ...DEFAULT_OPERATIONAL });
  }, [config]);

  const [updateConfig] = useMutation<UpdateScheduleConfigResponse>(
    UPDATE_SCHEDULE_CONFIG_MUTATION
  );
  const [createConfig] = useMutation<CreateScheduleConfigResponse>(
    CREATE_SCHEDULE_CONFIG_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const updateInput = config ? buildRoutineUpdateInput(form, config) : {};
  const isDirty = !config || Object.keys(updateInput).length > 0;

  const patch = (values: Partial<RoutineOperationalForm>) => {
    setForm((prev) => ({ ...prev, ...values }));
  };

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    setForm(config ? buildRoutineForm(config) : { ...DEFAULT_OPERATIONAL });
    setIsEditing(false);
  };

  const save = async () => {
    // Dia nenhum marcado = agenda vazia; barrar aqui evita salvar um estado que
    // silenciosamente para de gerar visitas.
    if (form.workDays.length === 0) {
      await execute(async () => {
        throw new Error("Escolha pelo menos um dia de trabalho");
      });
      return;
    }

    if (!config) {
      await execute(
        async () => {
          const res = await createConfig({
            variables: {
              input: buildCreateInputFromOperational(form, seller.id),
            },
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
          successMessage: "Rotina configurada com sucesso",
          onSuccess: () => {
            setIsEditing(false);
            onSaved();
          },
        }
      );
      return;
    }

    if (!isDirty) {
      setIsEditing(false);
      return;
    }

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
        successMessage: "Rotina atualizada com sucesso",
        onSuccess: () => {
          setIsEditing(false);
          onSaved();
        },
      }
    );
  };

  return {
    config,
    form,
    isEditing,
    isLoading,
    isDirty,
    patch,
    startEditing,
    cancelEditing,
    save,
  };
}
