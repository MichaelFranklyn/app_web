"use client";

import { Badge } from "@/components/Badges";
import { getButtonClasses } from "@/components/Button/Root/style";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ArrowUpRight, Route } from "lucide-react";
import Link from "next/link";

import { RoutineCapacity, VisitScheduleDay } from "../../interface";
import { WeekDayCell, isPastDay, sortVisitsByRoute } from "../../utils";
import { AddVisitCard } from "../AddVisitCard";
import { DayOffButton } from "../DayOffButton";
import { VisitCard } from "../VisitCard";
import { GenerateDayButton } from "./GenerateDayButton";

// Botão âmbar "Ver rota do dia" (link → /routines/[date]).
const routeButtonClass = getButtonClasses({
  appearance: "tinted",
  color: "amber",
  size: "sm",
  isIconOnly: false,
  fullWidth: true,
  active: false,
  noPadding: false,
  noUppercase: true,
});

interface Props {
  cell: WeekDayCell;
  todayIso: string;
  scheduleId: string;
  sellerId?: string | null;
  addSellerId: string | null;
  capacity: RoutineCapacity;
  /** Próximo dia da semana — alternativa de agendamento no AddVisitCard. */
  nextDay: VisitScheduleDay | null;
  /** O vendedor marcou este dia como não trabalhado. */
  isDayOff: boolean;
  onMarkDayOff: (date: string) => Promise<void>;
  onUnmarkDayOff: (date: string) => Promise<void>;
  onChanged: () => void;
}

/**
 * Uma coluna do kanban: o dia, suas paradas e o que dá para fazer com ele.
 *
 * São três estados, e a diferença entre os dois primeiros importa: "sem rota" é
 * um dia útil que ainda não foi planejado (dá para gerar rota ou agendar à
 * mão), "não trabalha" é o dia que o vendedor marcou — ele não recebe visita
 * nova por nenhum caminho, e a única ação oferecida é desmarcar.
 */
export function DayCell({
  cell,
  todayIso,
  scheduleId,
  sellerId,
  addSellerId,
  capacity,
  nextDay,
  isDayOff,
  onMarkDayOff,
  onUnmarkDayOff,
  onChanged,
}: Props) {
  const items = sortVisitsByRoute(cell.day?.items ?? []);
  const isToday = cell.date === todayIso;
  const isPast = isPastDay(cell.date, todayIso);
  // Quantas já foram concluídas — alimenta o badge de progresso do dia.
  const doneCount = items.filter((i) => i.status === "COMPLETED").length;
  const allDone = items.length > 0 && doneCount === items.length;
  // O que a marcação vai realocar. Só o pendente: o que já tem desfecho é
  // história, e história não se remarca.
  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const dayHref = `/routines/${cell.date}${sellerId ? `?seller=${sellerId}` : ""}`;

  return (
    <div className="max-w-[290px] min-w-[290px] shrink-0">
      <Card.Root
        className={`h-full ${isToday ? "ring-1 ring-(--amber) ring-inset" : ""}`}
      >
        <Card.Header bg="bg3">
          {cell.day && !isDayOff ? (
            <Link
              href={dayHref}
              className="group flex min-w-0 flex-col"
              title="Ver rota deste dia"
            >
              <Title
                variant="heading-sm"
                className="inline-flex items-center gap-3 transition-colors group-hover:text-(--amber)"
              >
                {cell.dayLabel}
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Title>
              <Title variant="micro" color="muted">
                {cell.weekdayLabel}
              </Title>
            </Link>
          ) : (
            <div className="flex flex-col">
              <Title variant="heading-sm">{cell.dayLabel}</Title>
              <Title variant="micro" color="muted">
                {cell.weekdayLabel}
              </Title>
            </div>
          )}
          <div className="flex items-center gap-6">
            {isToday && (
              <Badge.Root color="amber" appearance="tinted">
                <Badge.Text>Hoje</Badge.Text>
              </Badge.Root>
            )}
            {isDayOff ? (
              <Badge.Root color="neutral" appearance="tinted">
                <Badge.Text>Não trabalha</Badge.Text>
              </Badge.Root>
            ) : (
              <Badge.Root
                color={allDone ? "green" : "neutral"}
                appearance="tinted"
                title={
                  items.length > 0
                    ? `${doneCount} de ${items.length} concluída(s)`
                    : undefined
                }
              >
                <Badge.Text>
                  {doneCount > 0
                    ? `${doneCount}/${items.length}`
                    : items.length}
                </Badge.Text>
              </Badge.Root>
            )}
          </div>
        </Card.Header>

        {/* Sem padding no Body: a lista rola (área central) e as ações ficam
            fixas num rodapé próprio, separadas por um divisor. */}
        <Card.Body padding="none">
          {isDayOff ? (
            <>
              <div className="flex flex-1 flex-col items-center gap-4 p-16 text-center">
                <Title variant="body-sm" color="muted">
                  Você não trabalha neste dia
                </Title>
                <Title variant="micro" color="muted">
                  O sistema não vai planejar visitas para ele.
                </Title>
              </div>
              <div className="flex flex-col gap-8 border-t border-(--border) p-16">
                <DayOffButton
                  date={cell.date}
                  isDayOff
                  pendingCount={pendingCount}
                  onMark={onMarkDayOff}
                  onUnmark={onUnmarkDayOff}
                />
              </div>
            </>
          ) : !cell.day ? (
            // Dia útil ainda sem rotina: mesma anatomia dos demais — o aviso
            // ocupa a área central (é dela que vem o espaço em branco que
            // iguala a altura) e as ações ficam no rodapé.
            <>
              <div className="flex flex-1 flex-col items-center p-16">
                <Title variant="body-sm" color="muted">
                  Sem rota
                </Title>
              </div>

              {/* O usuário ainda pode querer trabalhar neste dia: gerar a rota
                  automática (pela carteira) ou agendar uma visita manual (cria
                  o dia com essa primeira visita). */}
              <div className="flex flex-col gap-8 border-t border-(--border) p-16">
                {/* Dia vencido não recebe rota nova: a visita já não pode
                    acontecer, e recomendá-la só consumiria o cliente da semana.
                    O backend recusa; aqui o botão nem aparece. */}
                {!isPast && (
                  <GenerateDayButton
                    date={cell.date}
                    sellerId={addSellerId}
                    onGenerated={onChanged}
                  />
                )}
                <AddVisitCard
                  day={null}
                  date={cell.date}
                  scheduleId={scheduleId}
                  nextDay={nextDay}
                  sellerId={addSellerId}
                  capacity={capacity}
                  onChanged={onChanged}
                />
                {!isPast && (
                  <DayOffButton
                    date={cell.date}
                    isDayOff={false}
                    pendingCount={pendingCount}
                    onMark={onMarkDayOff}
                    onUnmark={onUnmarkDayOff}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Área rolável: cresce até um teto e então rola por dentro, em
                  vez de esticar a coluna para baixo. */}
              <div className="max-h-[calc(100dvh-340px)] min-h-[64px] flex-1 overflow-y-auto p-16">
                {items.length === 0 ? (
                  <Title
                    variant="body-sm"
                    color="muted"
                    className="py-8 text-center"
                  >
                    Sem visitas
                  </Title>
                ) : (
                  <div className="flex flex-col gap-6">
                    {items.map((item) => (
                      <VisitCard
                        key={item.id}
                        item={item}
                        dayDate={cell.date}
                        onChanged={onChanged}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Rodapé fixo do dia: adicionar visita + abrir a rota. */}
              <div className="flex flex-col gap-8 border-t border-(--border) p-16">
                <AddVisitCard
                  day={cell.day}
                  date={cell.date}
                  scheduleId={scheduleId}
                  nextDay={nextDay}
                  sellerId={addSellerId}
                  capacity={capacity}
                  onChanged={onChanged}
                />
                <Link
                  href={dayHref}
                  className={routeButtonClass}
                  title="Abrir a rota deste dia no mapa"
                >
                  <Route size={14} />
                  Ver rota do dia
                </Link>
                {/* Só para frente: marcar um dia que já passou não muda nada e o
                    backend recusa. */}
                {!isPast && (
                  <DayOffButton
                    date={cell.date}
                    isDayOff={false}
                    pendingCount={pendingCount}
                    onMark={onMarkDayOff}
                    onUnmark={onUnmarkDayOff}
                  />
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card.Root>
    </div>
  );
}
