"use client";

import { ContactTypeTag } from "@/components/ContactTypeTag";
import { Title } from "@/components/Title";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useMemo } from "react";

import { dayChipLabel } from "../../utils";
import { ScheduleVisitButton } from "../ScheduleVisitButton";
import { SCHEDULED_VISITS_QUERY } from "./gql";
import { ScheduledVisit, ScheduledVisitsData } from "./interface";

interface Props {
  /** Nulo = o vendedor logado (o backend resolve). */
  sellerId: string | null;
  /** Para o "Marcar visita": a carteira de quem. */
  scheduleSellerId: string | null;
  /** Marcou uma visita: a lista de prioritários recarrega (o "Já marcado"). */
  onScheduled: () => void;
}

/**
 * O que já está combinado daqui para a frente, e o "Marcar visita" — um
 * bloco do painel "Sua semana", sempre aberto.
 *
 * Mora em Montar semana (desde 18/10/2026) porque é aqui que o vendedor decide
 * a semana: antes de escolher quem visitar, ele vê o que já tem marcado — o
 * cliente que pediu "passa aqui dia 12" e o que ele mesmo combinou. Cada dia
 * leva à rota daquele dia na Agenda.
 */
export function ScheduledVisits({
  sellerId,
  scheduleSellerId,
  onScheduled,
}: Props) {
  const { data, loading, error, refetch } = useQuery<ScheduledVisitsData>(
    SCHEDULED_VISITS_QUERY,
    { variables: { sellerId }, fetchPolicy: "cache-and-network" }
  );
  useQueryErrorToast(error, "Não foi possível carregar as visitas marcadas.");
  const visits = data?.scheduledVisits;

  const byDay = useMemo(() => {
    const days = new Map<string, ScheduledVisit[]>();
    for (const visit of visits ?? []) {
      days.set(visit.date, [...(days.get(visit.date) ?? []), visit]);
    }
    return [...days.entries()];
  }, [visits]);

  const count = visits?.length ?? 0;
  const dayHref = (date: string) =>
    `/routines/${date}${sellerId ? `?seller=${sellerId}` : ""}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-8">
        <Title variant="label" color="secondary">
          Visitas marcadas{count > 0 ? ` (${count})` : ""}
        </Title>
        <ScheduleVisitButton
          sellerId={scheduleSellerId}
          onScheduled={() => {
            void refetch();
            onScheduled();
          }}
        />
      </div>
      {loading && !visits ? (
        <Title variant="body-xs" color="muted">
          Carregando…
        </Title>
      ) : byDay.length === 0 ? (
        <Title variant="body-xs" color="muted">
          Nada marcado daqui para a frente. Quando um cliente pedir um dia, use
          Marcar visita.
        </Title>
      ) : (
        byDay.map(([date, dayVisits]) => (
          <div key={date} className="flex flex-col gap-4">
            <Link href={dayHref(date)} className="w-fit hover:underline">
              <Title variant="body-xs" weight="semibold" color="secondary">
                {dayChipLabel(date)}
              </Title>
            </Link>
            {dayVisits.map((visit) => (
              <div
                key={visit.itemId}
                className="flex items-center justify-between gap-8"
              >
                <div className="flex min-w-0 flex-col">
                  <Title variant="body-sm" weight="medium" className="truncate">
                    {visit.clientName}
                  </Title>
                  <Title variant="body-xs" color="muted">
                    {[visit.neighborhood, visit.cityLabel]
                      .filter(Boolean)
                      .join(" · ")}
                  </Title>
                </div>
                <ContactTypeTag contactType={visit.contactType} />
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
