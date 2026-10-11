"use client";

import { COMPLETE_FOLLOW_UP_MUTATION } from "@/graphql/followUps";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FOLLOW_UP_CACHE_FIELDS } from "@/utils/cacheFields";
import { getBrtTodayIso } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { CompleteFollowUpResponse } from "../../interface";
import { isSchedulable } from "../../utils";

interface Params {
  followUpId: string;
  /** Padrão de "houve contato comercial?" (sim para vendedor). */
  defaultCommercial: boolean;
  onDone: () => void;
}

/**
 * Concluir = "falei com o cliente". O que foi conversado é obrigatório (é o
 * histórico); marcar o próximo é opcional e vai na MESMA chamada — separado,
 * a primeira podia passar e a segunda falhar, deixando a conversa sem
 * continuação.
 */
export function useCompleteFollowUp({
  followUpId,
  defaultCommercial,
  onDone,
}: Params) {
  const [outcome, setOutcome] = useState("");
  // As duas perguntas decidem o que o contato resolve nas Pendências: o
  // comercial conta como contato da carteira; o "volte dia X" só se resolve
  // com a confirmação EXPLÍCITA (por isso nasce desmarcada).
  const [isCommercial, setIsCommercial] = useState(defaultCommercial);
  const [fulfillsReturn, setFulfillsReturn] = useState(false);
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [nextReason, setNextReason] = useState("");

  const [complete] = useMutation<CompleteFollowUpResponse>(
    COMPLETE_FOLLOW_UP_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const isValid =
    outcome.trim().length > 0 &&
    (!scheduleNext || isSchedulable(nextDate, getBrtTodayIso()));

  const submit = () =>
    execute(
      async () => {
        const res = await complete({
          variables: {
            input: {
              id: followUpId,
              outcome: outcome.trim(),
              nextDueDate: scheduleNext ? nextDate : null,
              nextReason: scheduleNext ? nextReason.trim() || null : null,
              isCommercial,
              fulfillsReturn,
            },
          },
        });
        const payload = res.data?.completeClientFollowUp;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao concluir o contato");
        }
        return payload;
      },
      {
        successMessage: scheduleNext
          ? "Contato concluído e o próximo agendado"
          : "Contato concluído",
        onSuccess: () => {
          onDone();
          void invalidateClient(FOLLOW_UP_CACHE_FIELDS);
        },
      }
    );

  return {
    outcome,
    setOutcome,
    isCommercial,
    setIsCommercial,
    fulfillsReturn,
    setFulfillsReturn,
    scheduleNext,
    setScheduleNext,
    nextDate,
    setNextDate,
    nextReason,
    setNextReason,
    isValid,
    isLoading,
    submit,
  };
}
