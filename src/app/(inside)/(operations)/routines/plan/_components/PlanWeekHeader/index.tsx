"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { RoutineSellerOption } from "../../../interface";
import { formatWeekRange, shiftWeekIso } from "../../../utils";

interface Props {
  weekStart: string;
  sellers?: RoutineSellerOption[];
  sellerId: string | null;
  onSelectSeller: (id: string) => void;
  onSelectWeek: (weekStartIso: string) => void;
}

/**
 * "Montar semana": de quem e qual semana. A semana que já passou não aparece —
 * não há o que montar nela.
 */
export function PlanWeekHeader({
  weekStart,
  sellers,
  sellerId,
  onSelectSeller,
  onSelectWeek,
}: Props) {
  const isFirstWeek = weekStart <= getCurrentWeekMondayIso();
  const options: SelectOption[] = (sellers ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const backHref = `/routines?${new URLSearchParams({
    ...(sellerId ? { sellerId } : {}),
    week: weekStart,
  }).toString()}`;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item href={backHref}>Agenda</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>Montar semana</Breadcrumb.Item>
      </Breadcrumb.Root>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Montar semana</PanelHeader.Title>
            <PanelHeader.Description>
              Escolha quem você quer ver de {formatWeekRange(weekStart)}. O
              sistema separa por região e monta o caminho de cada dia.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              {sellers && (
                <div className="desktop:w-[220px] w-full">
                  <Input.Select
                    size="sm"
                    options={options}
                    value={options.find((o) => o.value === sellerId) ?? null}
                    variant="single"
                    disabledClear
                    placeholder="Escolha o vendedor"
                    onChange={(val: SelectOption | SelectOption[] | null) => {
                      const opt = Array.isArray(val) ? val[0] : val;
                      if (opt) onSelectSeller(opt.value);
                    }}
                  />
                </div>
              )}
              <div className="desktop:w-auto flex w-full items-center gap-8">
                <Button.Root
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  isIconOnly
                  label="Semana anterior"
                  disabled={isFirstWeek}
                  onClick={() => onSelectWeek(shiftWeekIso(weekStart, -1))}
                >
                  <Button.Icon icon={ChevronLeft} />
                </Button.Root>
                <Button.Root
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  isIconOnly
                  label="Próxima semana"
                  onClick={() => onSelectWeek(shiftWeekIso(weekStart, 1))}
                >
                  <Button.Icon icon={ChevronRight} />
                </Button.Root>
              </div>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
