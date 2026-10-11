"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { formatDate } from "@/utils/format/date";

import { FollowUpActionModalProps } from "../../interface";
import { DueDatePicker } from "../DueDatePicker";
import { useRescheduleFollowUp } from "./useRescheduleFollowUp";

export function RescheduleFollowUpModal({
  open,
  onOpenChange,
  followUp,
  onDone,
}: FollowUpActionModalProps) {
  const form = useRescheduleFollowUp({
    followUpId: followUp.id,
    currentDate: followUp.dueDate,
    onDone: () => {
      onOpenChange(false);
      onDone();
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Reagendar contato"
          description={`Hoje está marcado para ${formatDate(followUp.dueDate)}. A data antiga fica no histórico.`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <DueDatePicker
              label="Novo dia do contato"
              value={form.dueDate}
              onChange={form.setDueDate}
            />
            <Input.Textarea
              label="Por que mudou (opcional)"
              rows={2}
              placeholder="Ex: Não atendeu. / Pediu para ligar depois do dia 20."
              value={form.note}
              onChange={(e) => form.setNote(e.target.value)}
            />
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
              disabled={form.isLoading}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={form.isLoading}
            disabled={!form.isValid}
            onClick={() => form.submit()}
          >
            <Button.Title>Reagendar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
