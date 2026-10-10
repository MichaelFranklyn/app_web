"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";

import { canSubmitReason, REASON_OPTIONS, RegenerateReason } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "desta semana" × "da semana que vem". */
  weekLabel: string;
  reason: RegenerateReason | null;
  note: string;
  isLoading: boolean;
  onReasonChange: (reason: RegenerateReason) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
}

/**
 * A pergunta antes de refazer: por quê?
 *
 * Metade das vezes a resposta é "vou para tal região" — e refazer não resolve
 * isso, a rotina sairia de casa outra vez. Perguntar primeiro é o que leva essa
 * pessoa ao planejador de viagem em vez de a um plano igual ao anterior.
 */
export function RegenerateReasonModal({
  open,
  onOpenChange,
  weekLabel,
  reason,
  note,
  isLoading,
  onReasonChange,
  onNoteChange,
  onSubmit,
}: Props) {
  const isTrip = reason === "TRIP";
  const selected = REASON_OPTIONS.find((option) => option.value === reason);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={`Por que refazer a rotina ${weekLabel}?`}
          description="Escolha o motivo. Ao refazer, as visitas que ainda não aconteceram são trocadas por uma rotina nova, e os ajustes feitos à mão nos dias que ainda vêm são perdidos. O que já foi feito não muda."
        />
        <Modal.Body>
          <div className="flex flex-col gap-12">
            {REASON_OPTIONS.map((option) => (
              <Input.Radio
                key={option.value}
                name="regenerate-reason"
                label={option.label}
                checked={reason === option.value}
                onChange={() => onReasonChange(option.value)}
              />
            ))}
            {selected && (
              <Title variant="body-xs" color="muted">
                {selected.hint}
              </Title>
            )}
            {reason && !isTrip && (
              <Input.Textarea
                label={
                  reason === "OTHER"
                    ? "Qual o motivo?"
                    : "Quer contar mais? (opcional)"
                }
                rows={2}
                maxLength={500}
                placeholder="Ex: a rotina me mandou para o interior no dia do rodízio."
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
              />
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
              disabled={isLoading}
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
            loading={isLoading}
            disabled={!canSubmitReason(reason, note)}
            onClick={onSubmit}
          >
            <Button.Title>
              {isTrip ? "Planejar viagem" : "Refazer rotina"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
