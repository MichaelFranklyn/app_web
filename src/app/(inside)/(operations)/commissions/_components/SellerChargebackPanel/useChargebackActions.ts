"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useCallback } from "react";

import {
  MARK_SELLER_CHARGEBACK_REFUNDED_MUTATION,
  MARK_SELLER_CHARGEBACK_SETTLED_MUTATION,
  SCHEDULE_SELLER_CHARGEBACK_MUTATION,
} from "../../gql";
import { monthLabel, YearMonth } from "../../utils";

interface BaseResponse {
  status: boolean;
  message: string;
}

/**
 * As três coisas que o escritório faz com um estorno do vendedor: escolher o
 * mês, registrar que descontou e registrar que devolveu.
 *
 * Ficam juntas porque são a mesma conversa — "o que já saiu e o que ainda vai
 * sair da comissão dele" — e porque o painel precisa recarregar a lista depois
 * de qualquer uma delas.
 */
export function useChargebackActions(onChanged: () => void) {
  const [schedule] = useMutation<{ scheduleSellerChargeback: BaseResponse }>(
    SCHEDULE_SELLER_CHARGEBACK_MUTATION
  );
  const [settle] = useMutation<{ markSellerChargebackSettled: BaseResponse }>(
    MARK_SELLER_CHARGEBACK_SETTLED_MUTATION
  );
  const [refund] = useMutation<{ markSellerChargebackRefunded: BaseResponse }>(
    MARK_SELLER_CHARGEBACK_REFUNDED_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const scheduleTo = useCallback(
    (installmentIds: string[], month: YearMonth | null) => {
      // O que se escolhe é o fechamento, não o dia.
      const target = month
        ? `${month.year}-${String(month.month).padStart(2, "0")}-01`
        : null;
      return execute(
        async () => {
          const res = await schedule({
            variables: { installmentIds, month: target },
          });
          if (!res.data?.scheduleSellerChargeback?.status) {
            throw new Error(
              res.data?.scheduleSellerChargeback?.message ??
                "Erro ao agendar o desconto"
            );
          }
        },
        {
          successMessage: month
            ? `Desconto agendado para ${monthLabel(month)}`
            : "Estorno devolvido para a fila",
          onSuccess: onChanged,
        }
      );
    },
    [execute, schedule, onChanged]
  );

  const markSettled = useCallback(
    (installmentIds: string[]) =>
      execute(
        async () => {
          const res = await settle({
            variables: { installmentIds, settledAt: toIsoDate(new Date()) },
          });
          if (!res.data?.markSellerChargebackSettled?.status) {
            throw new Error(
              res.data?.markSellerChargebackSettled?.message ??
                "Erro ao registrar o desconto"
            );
          }
        },
        { successMessage: "Desconto registrado", onSuccess: onChanged }
      ),
    [execute, settle, onChanged]
  );

  const markRefunded = useCallback(
    (installmentIds: string[]) =>
      execute(
        async () => {
          const res = await refund({ variables: { installmentIds } });
          if (!res.data?.markSellerChargebackRefunded?.status) {
            throw new Error(
              res.data?.markSellerChargebackRefunded?.message ??
                "Erro ao registrar a devolução"
            );
          }
        },
        { successMessage: "Devolução registrada", onSuccess: onChanged }
      ),
    [execute, refund, onChanged]
  );

  return { scheduleTo, markSettled, markRefunded, isLoading };
}
