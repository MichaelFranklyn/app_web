"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import {
  MARK_SELLER_DAY_OFF_MUTATION,
  SELLER_DAY_OFFS_QUERY,
  UNMARK_SELLER_DAY_OFF_MUTATION,
} from "./gql";
import { SellerDayOff, SellerDayOffsQueryData } from "./interface";
import { shiftDayIso } from "./utils";

interface MarkResponse {
  markSellerDayOff?: {
    status: boolean;
    message: string;
    data?: { rescheduled: number; released: number } | null;
  };
}

interface UnmarkResponse {
  unmarkSellerDayOff?: { status: boolean; message: string };
}

interface Args {
  /** Segunda-feira da semana em tela (ISO). */
  weekStart: string;
  /** Vendedor dono da rotina exibida; nulo = o próprio usuário logado. */
  sellerId?: string | null;
  /** A semana muda em volta: paradas trocam de dia, o dia muda de status. */
  onChanged: () => void;
}

export interface DayOffsResult {
  /** Datas ISO marcadas como não trabalhadas na semana em tela. */
  dayOffDates: Set<string>;
  byDate: Map<string, SellerDayOff>;
  mark: (date: string, reason?: string | null) => Promise<void>;
  unmark: (date: string) => Promise<void>;
}

/**
 * Os dias não trabalhados da semana em tela — leitura e escrita.
 *
 * Fica no nível da página porque a grade, a lista e o radar mostram a mesma
 * semana: se cada visualização buscasse as próprias folgas, elas divergiriam
 * durante a mesma sessão.
 *
 * As mutations NÃO fazem atualização otimista. Marcar um dia mexe na semana
 * inteira — as paradas mudam de dia, e o backend é quem sabe quantas couberam
 * —, então o caminho honesto é refazer a leitura em vez de adivinhar o
 * resultado na tela.
 */
export function useDayOffs({
  weekStart,
  sellerId,
  onChanged,
}: Args): DayOffsResult {
  const { execute } = useAsyncAction();

  const { data, refetch } = useQuery<SellerDayOffsQueryData>(
    SELLER_DAY_OFFS_QUERY,
    {
      variables: {
        sellerId: sellerId ?? null,
        from: weekStart,
        to: shiftDayIso(weekStart, 6),
      },
      // A folga pode ter sido marcada noutra aba (ou pelo gestor) desde a
      // última visita à tela.
      fetchPolicy: "cache-and-network",
    }
  );

  const dayOffs = useMemo(() => data?.seller_day_offs ?? [], [data]);

  const byDate = useMemo(
    () => new Map(dayOffs.map((dayOff) => [dayOff.date, dayOff])),
    [dayOffs]
  );

  const dayOffDates = useMemo(() => new Set(byDate.keys()), [byDate]);

  const [markMutation] = useMutation<MarkResponse>(
    MARK_SELLER_DAY_OFF_MUTATION
  );
  const [unmarkMutation] = useMutation<UnmarkResponse>(
    UNMARK_SELLER_DAY_OFF_MUTATION
  );

  const mark = useCallback(
    async (date: string, reason?: string | null) => {
      await execute(
        async () => {
          const { data: result } = await markMutation({
            variables: {
              sellerId: sellerId ?? null,
              date,
              reason: reason || null,
            },
          });
          const payload = result?.markSellerDayOff;
          if (!payload?.status) {
            throw new Error(
              payload?.message ?? "Não foi possível marcar o dia."
            );
          }
          return payload;
        },
        {
          // A mensagem vem do backend: só ele sabe quantas paradas foram
          // remarcadas e quantas ficaram sem vaga nesta semana.
          successMessage: (payload) => payload.message,
          onSuccess: () => {
            refetch();
            onChanged();
          },
        }
      );
    },
    [execute, markMutation, onChanged, refetch, sellerId]
  );

  const unmark = useCallback(
    async (date: string) => {
      await execute(
        async () => {
          const { data: result } = await unmarkMutation({
            variables: { sellerId: sellerId ?? null, date },
          });
          const payload = result?.unmarkSellerDayOff;
          if (!payload?.status) {
            throw new Error(
              payload?.message ?? "Não foi possível desmarcar o dia."
            );
          }
          return payload;
        },
        {
          successMessage: (payload) => payload.message,
          onSuccess: () => {
            refetch();
            onChanged();
          },
        }
      );
    },
    [execute, onChanged, refetch, sellerId, unmarkMutation]
  );

  return { dayOffDates, byDate, mark, unmark };
}
