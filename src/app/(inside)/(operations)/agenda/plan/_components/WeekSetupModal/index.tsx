"use client";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";

import { PriorityClient, WeekSelection } from "../../interface";
import { chosenNames, selectionPhrase } from "../../utils";
import { PreviewDays } from "./PreviewDays";
import { useWeekSetup } from "./useWeekSetup";
import { WeekSetupForm } from "./WeekSetupForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string | null;
  initialWeekStart: string;
  selection: WeekSelection;
  clients: PriorityClient[];
  /** Gravou: a tela leva a pessoa para a agenda daquela semana. */
  onPlanned: (weekStart: string) => void;
  isRedirecting: boolean;
}

/**
 * Organizar a semana, em dois passos no mesmo modal (um depois do outro, nunca
 * um modal sobre o outro): configurar a semana e conferir como ela ficou.
 * Nada entra na agenda até "Confirmar semana".
 */
export function WeekSetupModal({
  open,
  onOpenChange,
  sellerId,
  initialWeekStart,
  selection,
  clients,
  onPlanned,
  isRedirecting,
}: Props) {
  const form = useWeekSetup({
    open,
    sellerId,
    initialWeekStart,
    selection,
    clients,
    onPlanned,
  });
  const busy = form.isSaving || isRedirecting;
  const isPreview = form.step === "preview" && form.plan;
  const chosen = selectionPhrase(selection);

  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
    >
      <Modal.Content size="md">
        <Modal.Header
          title={isPreview ? "Como fica a sua semana" : "Organizar a semana"}
          description={
            isPreview
              ? "Confira dia a dia. Quem ficou sem dia foi posto onde você já vai estar perto."
              : chosen
                ? `Você escolheu ${chosenNames(selection, clients)} (${chosen}). Responda as quatro perguntas e o sistema monta os dias.`
                : "Você não escolheu ninguém. Responda as quatro perguntas e o sistema escolhe os clientes mais urgentes."
          }
        />
        <Modal.Body>
          {form.isOrganizing ? (
            <div className="flex flex-col gap-12" aria-busy="true">
              <Loading.Skeleton className="h-[120px] w-full" />
              <Loading.Skeleton className="h-[120px] w-full" />
            </div>
          ) : isPreview && form.plan ? (
            <PreviewDays plan={form.plan} />
          ) : (
            <WeekSetupForm form={form} />
          )}
        </Modal.Body>
        <Modal.Footer>
          {isPreview ? (
            <>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={busy}
                onClick={form.backToSetup}
              >
                <Button.Title>Voltar e ajustar</Button.Title>
              </Button.Root>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={busy}
                disabled={!form.plan || form.plan.added === 0}
                onClick={() => void form.confirm()}
              >
                <Button.Title>Confirmar semana</Button.Title>
              </Button.Root>
            </>
          ) : (
            <>
              <Modal.Close asChild>
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="md"
                  noUppercase
                  disabled={form.isOrganizing}
                >
                  <Button.Title>Cancelar</Button.Title>
                </Button.Root>
              </Modal.Close>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={form.isOrganizing}
                disabled={!form.isValid}
                onClick={() => void form.organize()}
              >
                <Button.Title>Organizar a semana</Button.Title>
              </Button.Root>
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
