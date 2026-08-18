"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { UPDATE_VISIT_ITEM_MUTATION } from "../../gql";
import { OVERDUE_VISITS_QUERY } from "./gql";
import {
  OverdueOutcome,
  OverdueVisit,
  OverdueVisitsQueryData,
} from "./interface";
import { plannedMoment } from "./utils";

interface UpdateItemResponse {
  updateVisitScheduleItem?: { status: boolean; message: string };
}

export function useOverdueVisits(sellerId?: string | null) {
  const { data, loading, refetch } = useQuery<OverdueVisitsQueryData>(
    OVERDUE_VISITS_QUERY,
    {
      variables: { sellerId: sellerId ?? null },
      // A dívida muda fora daqui: concluir a visita pela rota do dia ou pelo
      // cliente também a resolve.
      fetchPolicy: "cache-and-network",
    }
  );

  const initialData = useMemo<OverdueVisit[]>(
    () => data?.overdueVisits ?? [],
    [data]
  );
  const optimistic = useOptimisticList<OverdueVisit>({ initialData });

  const [updateItem] = useMutation<UpdateItemResponse>(
    UPDATE_VISIT_ITEM_MUTATION
  );
  const { execute } = useAsyncAction();
  // Qual visita está sendo respondida: trava só a linha clicada, não a lista.
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  const answer = (
    visit: OverdueVisit,
    outcome: OverdueOutcome,
    successMessage: string
  ) => {
    setAnsweringId(visit.id);
    // Some da fila na hora — a resposta é o que tira a visita da dívida.
    optimistic.removeOptimistic(visit.id);
    return execute(
      async () => {
        const actualVisitAt = visit.day ? plannedMoment(visit.day.date) : null;
        const res = await updateItem({
          variables: {
            id: visit.id,
            input: {
              status: outcome,
              ...(outcome === "COMPLETED" && actualVisitAt
                ? { actualVisitAt }
                : {}),
            },
          },
        });
        const payload = res.data?.updateVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao registrar a resposta");
        }
        return payload;
      },
      {
        successMessage,
        onSuccess: () => {
          optimistic.commit();
          setAnsweringId(null);
          refetch();
        },
        onError: () => {
          optimistic.rollback();
          setAnsweringId(null);
        },
      }
    );
  };

  return {
    visits: optimistic.items,
    loading: loading && !data,
    answeringId,
    answer,
    refetch,
  };
}
