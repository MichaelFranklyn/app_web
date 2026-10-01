"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { CANCEL_SELLER_TRIP_MUTATION, SELLER_TRIPS_QUERY } from "./gql";
import { SellerTrip, SellerTripsQueryData } from "./interface";

interface CancelResponse {
  cancelSellerTrip?: { status: boolean; message: string };
}

interface Args {
  /** Vendedor da rotina em tela; nulo = o próprio usuário logado. */
  sellerId?: string | null;
}

export interface SellerTripsResult {
  trips: SellerTrip[];
  refetch: () => void;
  /** Lança em caso de recusa — quem chama (o `ConfirmModal`) mostra o erro. */
  cancel: (id: string) => Promise<void>;
}

/**
 * As viagens do vendedor que ainda não terminaram — leitura e cancelamento.
 *
 * No nível da página, como as folgas (`useDayOffs`): o cartão das viagens e o
 * planejador do cabeçalho falam da mesma lista. Sem atualização otimista pelo
 * mesmo motivo de lá: cancelar mexe na semana inteira, e quem sabe o que saiu
 * é o backend — a página relê a rotina depois.
 */
export function useSellerTrips({ sellerId }: Args): SellerTripsResult {
  const { data, refetch } = useQuery<SellerTripsQueryData>(SELLER_TRIPS_QUERY, {
    variables: { sellerId: sellerId ?? null },
    fetchPolicy: "cache-and-network",
  });
  const trips = useMemo(() => data?.seller_trips ?? [], [data]);

  const [cancelMutation] = useMutation<CancelResponse>(
    CANCEL_SELLER_TRIP_MUTATION
  );

  const cancel = useCallback(
    async (id: string) => {
      const { data: result } = await cancelMutation({ variables: { id } });
      const payload = result?.cancelSellerTrip;
      if (!payload?.status) {
        throw new Error(
          payload?.message ?? "Não foi possível cancelar a viagem."
        );
      }
    },
    [cancelMutation]
  );

  return { trips, refetch: () => void refetch(), cancel };
}
