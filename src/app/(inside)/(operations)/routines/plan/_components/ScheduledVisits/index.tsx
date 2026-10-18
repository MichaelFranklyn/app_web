"use client";

import { Card } from "@/components/Card";
import { Collapse } from "@/components/Collapse";
import { ContactTypeTag } from "@/components/ContactTypeTag";
import { Title } from "@/components/Title";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
 * O que já está combinado daqui para a frente, e o "Marcar visita".
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
  const [open, setOpen] = useState(true);

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
    <Card.Root>
      <Collapse.Header>
        <Collapse.Trigger
          variant="bar"
          open={open}
          onToggle={() => setOpen((v) => !v)}
        >
          <div className="flex min-w-0 flex-col">
            <Title variant="body-sm" weight="semibold">
              Visitas marcadas{count > 0 ? ` (${count})` : ""}
            </Title>
            <Title variant="body-xs" color="muted">
              O que já está combinado daqui para a frente.
            </Title>
          </div>
        </Collapse.Trigger>
        <div className="flex items-center pr-12">
          <ScheduleVisitButton
            sellerId={scheduleSellerId}
            onScheduled={() => {
              void refetch();
              onScheduled();
            }}
          />
        </div>
      </Collapse.Header>
      {open && (
        <div className="flex flex-col divide-y divide-(--border)">
          {loading && !visits ? (
            <Title variant="body-sm" color="muted" className="px-16 py-12">
              Carregando…
            </Title>
          ) : byDay.length === 0 ? (
            <Title variant="body-sm" color="muted" className="px-16 py-12">
              Nada marcado daqui para a frente. Quando um cliente pedir um dia,
              use Marcar visita.
            </Title>
          ) : (
            byDay.map(([date, dayVisits]) => (
              <div key={date} className="flex flex-col gap-6 px-16 py-12">
                <Link href={dayHref(date)} className="w-fit hover:underline">
                  <Title variant="label" color="secondary">
                    {dayChipLabel(date)}
                  </Title>
                </Link>
                {dayVisits.map((visit) => (
                  <div
                    key={visit.itemId}
                    className="flex items-center justify-between gap-8"
                  >
                    <div className="flex min-w-0 flex-col">
                      <Title variant="body-sm" weight="medium">
                        {visit.clientName}
                      </Title>
                      <Title variant="body-xs" color="muted">
                        {[visit.neighborhood, visit.cityLabel]
                          .filter(Boolean)
                          .join(" · ")}
                      </Title>
                    </div>
                    <div className="flex shrink-0 items-center gap-6">
                      <ContactTypeTag contactType={visit.contactType} />
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </Card.Root>
  );
}
