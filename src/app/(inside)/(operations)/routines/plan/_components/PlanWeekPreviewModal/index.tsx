"use client";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";

import { PriorityClient, WeekSelection } from "../../interface";
import { selectionPhrase } from "../../utils";
import { DaysPicker } from "../DaysPicker";
import { PreviewDays } from "./PreviewDays";
import { usePlanPreview } from "./usePlanPreview";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string | null;
  weekStart: string;
  selection: WeekSelection;
  clients: PriorityClient[];
  openDates: string[];
  workDates: string[];
  /** Gravou: a tela leva a pessoa para a agenda da semana. */
  onPlanned: () => void;
  isRedirecting: boolean;
}

/**
 * Conferir antes de gravar: em que dias o vendedor vai trabalhar e como a
 * semana fica. Nada entra na agenda até "Confirmar semana".
 */
export function PlanWeekPreviewModal({
  open,
  onOpenChange,
  sellerId,
  weekStart,
  selection,
  clients,
  openDates,
  workDates,
  onPlanned,
  isRedirecting,
}: Props) {
  const preview = usePlanPreview({
    open,
    sellerId,
    weekStart,
    selection,
    clients,
    workDates,
    onPlanned,
  });
  const busy = preview.isSaving || isRedirecting;

  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
    >
      <Modal.Content size="md">
        <Modal.Header
          title="Como fica a sua semana"
          description={`${selectionPhrase(selection)}. Quem ficou sem dia foi posto onde você já vai estar perto.`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <DaysPicker
              openDates={openDates}
              days={preview.days}
              onToggle={preview.toggleDay}
            />
            {preview.isPreviewing || !preview.plan ? (
              <div className="flex flex-col gap-12" aria-busy="true">
                <Loading.Skeleton className="h-[120px] w-full" />
                <Loading.Skeleton className="h-[120px] w-full" />
              </div>
            ) : (
              <PreviewDays plan={preview.plan} />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={busy}
            >
              <Button.Title>Voltar e mexer</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={busy}
            disabled={
              !preview.plan || preview.plan.added === 0 || preview.isPreviewing
            }
            onClick={() => void preview.confirm()}
          >
            <Button.Title>Confirmar semana</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
