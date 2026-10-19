"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { Route } from "lucide-react";

import { AgendaDay, longDayLabel } from "../../calendar";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
import { DayOffButton } from "../DayOffButton";
import { VisitCard } from "../VisitCard";

interface Props {
  date: string;
  agendaDay: AgendaDay | undefined;
  todayIso: string;
  person: AgendaPerson | null;
  sellerId: string | null;
  isSellerAgenda: boolean;
  isDayOff: boolean;
  onMarkDayOff: (date: string) => Promise<void>;
  onUnmarkDayOff: (date: string) => Promise<void>;
  onChanged: () => void;
}

/**
 * Um dia com espaço: os cartões completos (fábricas, score, WhatsApp), o
 * "+ Agendar" e, na rotina de quem vende, a rota no mapa e a folga.
 */
export function AgendaDayView({
  date,
  agendaDay,
  todayIso,
  person,
  sellerId,
  isSellerAgenda,
  isDayOff,
  onMarkDayOff,
  onUnmarkDayOff,
  onChanged,
}: Props) {
  const items = sortVisitsByRoute(agendaDay?.day?.items ?? []);
  const isPast = isPastDay(date, todayIso);
  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const routeHref = `/agenda/${date}${sellerId ? `?seller=${sellerId}` : ""}`;

  return (
    <Card.Root>
      <Card.Header bg="bg3">
        <Title variant="heading-sm" className="first-letter:uppercase">
          {longDayLabel(date)}
        </Title>
        {isSellerAgenda && items.length > 0 && !isDayOff && (
          <Button.Link
            href={routeHref}
            appearance="tinted"
            size="sm"
            noUppercase
            title="Abrir a rota deste dia no mapa"
          >
            <Button.Icon icon={Route} />
            <Button.Title>Ver rota do dia</Button.Title>
          </Button.Link>
        )}
      </Card.Header>
      <Card.Body>
        {isDayOff ? (
          <Title variant="body-sm" color="muted" className="text-center">
            Você não trabalha neste dia. O sistema não vai planejar visitas para
            ele.
          </Title>
        ) : items.length === 0 ? (
          <Title variant="body-sm" color="muted" className="text-center">
            Nada marcado neste dia.
          </Title>
        ) : (
          <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-8">
            {items.map((item) => (
              <VisitCard
                key={item.id}
                item={item}
                dayDate={date}
                onChanged={onChanged}
              />
            ))}
          </div>
        )}
      </Card.Body>
      {!isPast && (
        <Card.Section divided>
          <div className="tablet:flex-row flex flex-col gap-8">
            <div className="tablet:w-[240px]">
              <AgendaAddMenu
                date={date}
                person={person}
                sellerId={sellerId}
                isDayOff={isDayOff}
                onChanged={onChanged}
              />
            </div>
            {isSellerAgenda && (
              <div className="tablet:w-[240px]">
                <DayOffButton
                  date={date}
                  isDayOff={isDayOff}
                  pendingCount={pendingCount}
                  onMark={onMarkDayOff}
                  onUnmark={onUnmarkDayOff}
                />
              </div>
            )}
          </div>
        </Card.Section>
      )}
    </Card.Root>
  );
}
