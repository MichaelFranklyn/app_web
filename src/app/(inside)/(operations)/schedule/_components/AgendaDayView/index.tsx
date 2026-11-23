"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { useUserRole } from "@/services/flowTour/useUserRole";
import { plural } from "@/utils/format/plural";
import { CalendarCheck, CalendarOff, Map as MapIcon } from "lucide-react";

import { AgendaDay, alsoInOfficeOf } from "../../calendar";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
import { DayMoreMenu } from "../DayMoreMenu";
import { DayRoute } from "../DayRoute";
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
  const stopTotal = items.length + otherOffices.length;
  // O número de cada parada presencial, na ordem do trajeto — o mesmo do pino
  // no mapa. A ligação não é parada: fica sem número.
  const stopNumbers = new Map<string, number>();
  for (const item of items) {
    if (item.contactType !== "REMOTE") {
      stopNumbers.set(item.id, stopNumbers.size + 1);
    }
  }
  const scrollToRoute = () =>
    document
      .getElementById("day-route")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

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
      {/* No desktop a lista e o trajeto lado a lado: a ordem dos cartões é a
          dos pinos, e ver os dois juntos é o que faz dela uma rota. */}
      <div
        className={
          showRoute
            ? "desktop:grid desktop:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] desktop:items-start flex flex-col gap-20"
            : "flex flex-col gap-20"
        }
      >
        <Card.Root>
          <Card.Header bg="bg3">
            {/* A data já está na barra da agenda: aqui vai o que o dia é. */}
            <div className="flex min-w-0 flex-col">
              <Title variant="heading-sm">
                {showRoute ? "Rota do dia" : "Compromissos do dia"}
              </Title>
              {!isDayOff && stopTotal > 0 && (
                <Title variant="body-xs" color="muted">
                  {plural(stopTotal, "compromisso", "compromissos")}
                  {pendingCount > 0 && pendingCount < items.length
                    ? ` · ${plural(pendingCount, "pendente", "pendentes")}`
                    : ""}
                </Title>
              )}
            </div>
            {(routeDay || !isPast || showRoute) && (
              // Empilhado (celular), quatro botões de largura total davam um
              // cabeçalho de 209px antes da primeira visita (relato de
              // 20/11/2026). Aqui eles quebram linha no tamanho natural e
              // crescem para preencher: dois por linha onde cabem, um só onde
              // o texto não cabe ao lado — grade fixa de 2 estourava em 360px.
              <Card.Header.Actions className="group-data-[actions-mode=column]/cardhead:flex-row group-data-[actions-mode=column]/cardhead:flex-wrap group-data-[actions-mode=column]/cardhead:[&>*]:w-auto group-data-[actions-mode=column]/cardhead:[&>*]:flex-auto group-data-[actions-mode=column]/cardhead:[&>div]:w-auto">
                {showRoute && (
                  <Button.Root
                    appearance="outline"
                    color="neutral"
                    size="sm"
                    className="desktop:hidden"
                    onClick={scrollToRoute}
                  >
                    <Button.Icon icon={MapIcon} />
                    <Button.Title>Ver no mapa</Button.Title>
                  </Button.Root>
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
                <DayMoreMenu
                  date={date}
                  routeDay={routeDay}
                  sellerName={sellerName}
                  canMarkDayOff={!isPast && isSellerAgenda}
                  isDayOff={isDayOff}
                  pendingCount={pendingCount}
                  onMarkDayOff={onMarkDayOff}
                  onUnmarkDayOff={onUnmarkDayOff}
                />
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
                  Você não trabalha neste dia. O sistema não vai planejar
                  visitas para ele.
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
              <div
                className={
                  showRoute
                    ? "grid grid-cols-1 gap-8"
                    : "tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-8"
                }
              >
                {items.map((item) => (
                  <VisitCard
                    key={item.id}
                    item={item}
                    dayDate={date}
                    alsoInOffice={alsoInOfficeOf(item, alsoInOffice)}
                    quickAnswer={quickAnswer}
                    stopNumber={stopNumbers.get(item.id) ?? null}
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
          <div id="day-route" className="flex scroll-mt-16 flex-col gap-20">
            <DayRoute
              date={date}
              day={routeDay}
              canEditDeparture={isSeller}
              otherOfficeStops={otherOffices}
              onChanged={onChanged}
            />
          </div>
        )}
      </div>
    </div>
  );
}
