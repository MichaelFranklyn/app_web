"use client";
import { ReactNode } from "react";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { agendaTitle } from "../../calendar";
import { AgendaPerson, AgendaView } from "../../interface";
import { PlanWeekLink } from "../PlanWeekLink";

const VIEW_OPTIONS: { label: string; value: AgendaView }[] = [
  { label: "Dia", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
];

const STEP_LABEL: Record<AgendaView, [string, string]> = {
  day: ["Dia anterior", "Próximo dia"],
  week: ["Semana anterior", "Próxima semana"],
  month: ["Mês anterior", "Próximo mês"],
};

interface Props {
  view: AgendaView;
  anchor: string;
  weekStart: string;
  /** Só para quem abre a agenda de outra pessoa (gestor). */
  people?: AgendaPerson[];
  personId: string | null;
  onSelectPerson?: (id: string) => void;
  /** A rotina de quem vende se monta no Montar semana. */
  sellerId: string | null;
  isSellerAgenda: boolean;
  onView: (view: AgendaView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  /**
   * O "Mais ações" da semana (folha, link de resposta), colado no "Montar
   * semana": é tudo o que se faz com a semana, num lugar só.
   */
  weekActions?: ReactNode;
}

/**
 * A barra da folhinha, como a do Google Agenda: "Hoje", as setas, o período
 * por extenso e a troca entre dia, semana e mês. O gestor escolhe de quem é a
 * agenda — de quem vende ou de quem é do escritório.
 */
export function AgendaToolbar({
  view,
  anchor,
  weekStart,
  people,
  personId,
  onSelectPerson,
  sellerId,
  isSellerAgenda,
  onView,
  onPrev,
  onNext,
  onToday,
  weekActions,
}: Props) {
  const personOptions: SelectOption[] = (people ?? []).map((person) => ({
    value: person.id,
    label: person.sellerId ? person.name : `${person.name} (escritório)`,
  }));
  const [prevLabel, nextLabel] = STEP_LABEL[view];

  return (
    <div className="flex flex-col gap-12">
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.agenda}>
              Agenda
            </PanelHeader.Heading>
            <PanelHeader.Description>
              As visitas e as ligações de cada dia — inclusive as combinadas com
              o cliente.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <div
        className="flex flex-wrap items-center gap-8"
        data-tour="routines-week-nav"
      >
        {/* Sempre neutro: aceso em âmbar ele competia com o "Agendar", a
            ação principal (crítica de 23/11/2026). O período no título já diz
            onde se está. */}
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          onClick={onToday}
        >
          <Button.Title>Hoje</Button.Title>
        </Button.Root>
        <div className="flex items-center gap-4">
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            isIconOnly
            label={prevLabel}
            onClick={onPrev}
          >
            <Button.Icon icon={ChevronLeft} />
          </Button.Root>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            isIconOnly
            label={nextLabel}
            onClick={onNext}
          >
            <Button.Icon icon={ChevronRight} />
          </Button.Root>
        </div>
        <Title
          variant="heading-sm"
          className="min-w-0 flex-1 first-letter:uppercase"
        >
          {agendaTitle(view, anchor)}
        </Title>

        <div className="desktop:w-auto flex w-full flex-wrap items-center gap-8">
          {people && (
            <div className="tablet:w-[240px] w-full">
              <Input.Select
                size="sm"
                options={personOptions}
                value={personOptions.find((o) => o.value === personId) ?? null}
                variant="single"
                disabledClear
                placeholder="Agenda de quem?"
                aria-label="Agenda de"
                onChange={(val: SelectOption | SelectOption[] | null) => {
                  const opt = Array.isArray(val) ? val[0] : val;
                  if (opt) onSelectPerson?.(opt.value);
                }}
              />
            </div>
          )}
          <ToggleGroup
            aria-label="Visão da agenda"
            data-tour="routines-view-toggle"
            options={VIEW_OPTIONS}
            value={view}
            onChange={onView}
            fullWidthBelowDesktop
          />
          {isSellerAgenda && (
            // Abaixo do desktop, "Montar semana" fica com a linha de baixo
            // inteira (ao lado das visões sobrava meia linha).
            <div
              className="max-desktop:w-full flex items-center gap-8"
              data-tour="routines-header-actions"
            >
              <PlanWeekLink
                weekStart={weekStart}
                sellerId={sellerId}
                className="max-desktop:flex-1"
              />
              {weekActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
