"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { VISIT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";

import { UPDATE_CROSS_OFFICE_VISIT_MUTATION } from "../../gql";
import { CrossOfficeStop, UpdateCrossOfficeVisitData } from "../../interface";
import { VisitStatus } from "@/utils/visit";

interface Args {
  stop: CrossOfficeStop;
  onChanged: () => void;
}

/**
 * Concluir, reabrir ou marcar "Não estava" numa parada do outro escritório da
 * pessoa, sem trocar de escritório. Só o estado viaja: o backend carimba a hora
 * e espelha a conclusão presencial no escritório de cá. Pedido e estoque
 * continuam no escritório dono da fábrica.
 */
export function useOtherOfficeStop({ stop, onChanged }: Args) {
  const [updateVisit] = useMutation<UpdateCrossOfficeVisitData>(
    UPDATE_CROSS_OFFICE_VISIT_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const setStatus = (status: VisitStatus, successMessage: string) =>
    execute(
      async () => {
        const res = await updateVisit({
          variables: { id: stop.id, input: { status } },
        });
        const payload = res.data?.updateCrossOfficeVisit;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Não deu para salvar a visita.");
        }
        return payload;
      },
      {
        successMessage,
        onSuccess: () => {
          void invalidateClient(VISIT_CACHE_FIELDS);
          onChanged();
        },
      }
    );

  const toggleCompleted = (checked: boolean) =>
    setStatus(
      checked ? "COMPLETED" : "PENDING",
      checked ? "Visita concluída." : "Visita reaberta."
    );

  const markAbsent = () =>
    setStatus("CLIENT_ABSENT", "Anotado: o cliente não estava.");

  return { toggleCompleted, markAbsent, isSaving: isLoading };
}
