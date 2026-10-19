"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { VISIT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";

import { AgendaDrag } from "./dragItem";
import { RESCHEDULE_VISIT_MUTATION } from "./gql";
import { formatDayLabel } from "./utils";

interface RescheduleResponse {
  rescheduleVisit?: { status: boolean; message: string };
}

/**
 * Soltar um compromisso noutro dia é remarcá-lo para aquela data — a mesma
 * remarcação do menu, com o motivo "Reagendado" (mudou de data, não falhou).
 * As recusas (dia cheio, folga, data passada) voltam do servidor como toast.
 */
export function useMoveItem(onChanged: () => void) {
  const [rescheduleVisit] = useMutation<RescheduleResponse>(
    RESCHEDULE_VISIT_MUTATION
  );
  const { execute } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  return (drag: AgendaDrag, toDate: string) => {
    if (drag.fromDate === toDate) return;
    void execute(
      async () => {
        const res = await rescheduleVisit({
          variables: {
            input: {
              originalItemId: drag.itemId,
              reason: "RESCHEDULED",
              targetDate: toDate,
            },
          },
        });
        const payload = res.data?.rescheduleVisit;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Não foi possível mudar o dia");
        }
        return payload;
      },
      {
        successMessage: `Movido para ${formatDayLabel(toDate)}`,
        onSuccess: () => {
          onChanged();
          void invalidateClient(VISIT_CACHE_FIELDS);
        },
      }
    );
  };
}
