"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { useUserRole } from "@/services/flowTour/useUserRole";
import { CalendarCheck, CalendarOff } from "lucide-react";

import { AgendaDay, alsoInOfficeOf, longDayLabel } from "../../calendar";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
import { DayOffButton } from "../DayOffButton";
import { DayRoute } from "../DayRoute";
import { DayRouteActions } from "../DayRouteActions";
import { OtherOfficeStopCard } from "../OtherOfficeStop";
import { OverdueVisits } from "../OverdueVisits";
import { VisitCard } from "../VisitCard";
import { usePushAnswer } from "./usePushAnswer";

interface Props {
  date: string;
  agendaDay: AgendaDay | undefined;
  todayIso: string;
  person: AgendaPerson | null;
  sellerId: string | null;
  isSellerAgenda: boolean;
  /** Quem vende — vai no cabeçalho da folha impressa. */
  sellerName: string | null;
  isDayOff: boolean;
  onMarkDayOff: (date: string) => Promise<void>;
  onUnmarkDayOff: (date: string) => Promise<void>;
  onChanged: () => void;
}

/**
 * Um dia com espaço: os cartões completos (fábricas, score, WhatsApp), o
 * "+ Agendar" e, na rotina de quem vende, a folga e a rota — resumo, partida,
 * mapa e folha impressa. A rota era uma tela à parte (`/agenda/<dia>`), que
 * buscava a agenda por outro caminho e mostrava outra pessoa e outras paradas.
 */
export function AgendaDayView({
  date,
  agendaDay,
  todayIso,
  person,
  sellerId,
  isSellerAgenda,
  sellerName,
  isDayOff,
  onMarkDayOff,
  onUnmarkDayOff,
  onChanged,
}: Props) {
  // Só o vendedor muda a própria partida e responde pelo que houve; o gestor
  // acompanha.
  const isSeller = useUserRole() === "SELLER";
  const day = agendaDay?.day ?? null;
  const items = sortVisitsByRoute(day?.items ?? []);
  // Paradas da rotina da pessoa nos outros escritórios: aparecem, se concluem
  // e entram na rota do dia aqui; o "Não trabalho" continua sendo de cá.
  const otherOffices = agendaDay?.otherOffices ?? [];
  const alsoInOffice = agendaDay?.alsoInOffice;
  const isPast = isPastDay(date, todayIso);
  // Os botões "Visitei / Não deu" no cartão: só a rota de HOJE do próprio
  // vendedor. Dia passado é com as vencidas, que registram a data planejada.
  const quickAnswer = isSeller && isSellerAgenda && date === todayIso;
  const pushAnswer = usePushAnswer(items.map((i) => i.id));
  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const routeDay = isSellerAgenda && !isDayOff && items.length > 0 ? day : null;
  // A rota aparece quando há para onde dirigir — daqui ou do outro
  // escritório: um dia só com visitas de lá também é um trajeto.
  const showRoute =
    isSellerAgenda &&
    !isDayOff &&
    [...items, ...otherOffices].some((s) => s.contactType !== "REMOTE");

  return (
    <div className="flex flex-col gap-20">
      {/* A dívida do passado só é cobrada HOJE: é a tela de trabalho. Sem
          pessoa escolhida (o próprio vendedor), o backend escopa ao logado. */}
      {date === todayIso && isSellerAgenda && (
        <OverdueVisits
          sellerId={person ? sellerId : null}
          canAnswer={isSeller}
          onAnswered={onChanged}
        />
      )}
      <Card.Root>
        <Card.Header bg="bg3">
          <Title variant="heading-sm" className="first-letter:uppercase">
            {longDayLabel(date)}
          </Title>
          {(routeDay || !isPast) && (
            // Empilhado (celular), quatro botões de largura total davam um
            // cabeçalho de 209px antes da primeira visita (relato de
            // 20/11/2026). Aqui eles quebram linha no tamanho natural e
            // crescem para preencher: dois por linha onde cabem, um só onde
            // o texto não cabe ao lado — grade fixa de 2 estourava em 360px.
            <Card.Header.Actions className="group-data-[actions-mode=column]/cardhead:flex-row group-data-[actions-mode=column]/cardhead:flex-wrap group-data-[actions-mode=column]/cardhead:[&>*]:w-auto group-data-[actions-mode=column]/cardhead:[&>*]:flex-auto group-data-[actions-mode=column]/cardhead:[&>div]:w-auto">
              {routeDay && (
                <DayRouteActions day={routeDay} sellerName={sellerName} />
              )}
              {!isPast && (
                <AgendaAddMenu
                  variant="header"
                  date={date}
                  person={person}
                  sellerId={sellerId}
                  isDayOff={isDayOff}
                  onChanged={onChanged}
                />
              )}
              {!isPast && isSellerAgenda && (
                <DayOffButton
                  date={date}
                  isDayOff={isDayOff}
                  pendingCount={pendingCount}
                  onMark={onMarkDayOff}
                  onUnmark={onUnmarkDayOff}
                />
              )}
            </Card.Header.Actions>
          )}
        </Card.Header>
        <Card.Body>
          {/* EmptyState `flat`: o dia já é um cartão — cartão dentro de
              cartão não (18/11/2026). */}
          {isDayOff ? (
            <EmptyState.Root flat data-testid="agenda-day-off">
              <EmptyState.Icon>
                <CalendarOff size={32} />
              </EmptyState.Icon>
              <EmptyState.Title>Dia sem trabalho</EmptyState.Title>
              <EmptyState.Description>
                Você não trabalha neste dia. O sistema não vai planejar visitas
                para ele.
              </EmptyState.Description>
            </EmptyState.Root>
          ) : items.length === 0 && otherOffices.length === 0 ? (
            <EmptyState.Root flat data-testid="agenda-empty-day">
              <EmptyState.Icon>
                <CalendarCheck size={32} />
              </EmptyState.Icon>
              <EmptyState.Title>Nada marcado neste dia</EmptyState.Title>
              <EmptyState.Description>
                {isPast
                  ? "Nenhuma visita nem ligação ficou registrada para este dia."
                  : "Nenhuma visita nem ligação por aqui. Use “Agendar” para marcar uma à mão ou monte a semana para o sistema traçar a rota."}
              </EmptyState.Description>
            </EmptyState.Root>
          ) : (
            <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-8">
              {items.map((item) => (
                <VisitCard
                  key={item.id}
                  item={item}
                  dayDate={date}
                  alsoInOffice={alsoInOfficeOf(item, alsoInOffice)}
                  quickAnswer={quickAnswer}
                  autoAnswer={
                    pushAnswer?.visitId === item.id ? pushAnswer.answer : null
                  }
                  onChanged={onChanged}
                />
              ))}
              {otherOffices.map((stop) => (
                <OtherOfficeStopCard
                  key={stop.id}
                  stop={stop}
                  onChanged={onChanged}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card.Root>
      {showRoute && (
        <DayRoute
          date={date}
          day={routeDay}
          canEditDeparture={isSeller}
          otherOfficeStops={otherOffices}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
