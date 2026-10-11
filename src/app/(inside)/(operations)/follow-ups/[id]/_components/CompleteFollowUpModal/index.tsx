"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";

import { FollowUpActionModalProps } from "../../interface";
import { DueDatePicker } from "../DueDatePicker";
import { useCompleteFollowUp } from "./useCompleteFollowUp";

export function CompleteFollowUpModal({
  open,
  onOpenChange,
  followUp,
  onDone,
}: FollowUpActionModalProps) {
  const form = useCompleteFollowUp({
    followUpId: followUp.id,
    defaultCommercial: followUp.defaultCommercial,
    onDone: () => {
      onOpenChange(false);
      onDone();
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Concluir contato"
          description="Concluir é dizer que você falou com o cliente. Se ele não atendeu, feche e use Reagendar."
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Input.Textarea
              label="O que foi conversado"
              required
              rows={4}
              placeholder="Ex: Gostou do orçamento, vai ver com o sócio e responde até sexta."
              value={form.outcome}
              onChange={(e) => form.setOutcome(e.target.value)}
            />
            <Input.Checkbox
              label="Foi uma conversa de venda com o cliente"
              checked={form.isCommercial}
              onChange={(e) => form.setIsCommercial(e.target.checked)}
            />
            <Title variant="body-xs" color="muted">
              Marque quando falou de pedido, orçamento ou relacionamento — é o
              que tira o cliente de &quot;sem contato&quot; nas Pendências.
              Ligação só sobre boleto ou entrega não conta.
            </Title>
            {followUp.linkedReturn ? (
              <Title variant="body-sm">
                Concluir atende o retorno combinado para{" "}
                {formatDate(followUp.linkedReturn.returnDate)}.
              </Title>
            ) : (
              followUp.openReturn && (
                <Input.Checkbox
                  label={`Este contato atendeu o retorno combinado para ${formatDate(
                    followUp.openReturn.returnDate
                  )} (combinado em ${formatDate(followUp.openReturn.agreedOn)})`}
                  checked={form.fulfillsReturn}
                  onChange={(e) => form.setFulfillsReturn(e.target.checked)}
                />
              )
            )}
            <Input.Checkbox
              label="Já agendar o próximo contato"
              checked={form.scheduleNext}
              onChange={(e) => form.setScheduleNext(e.target.checked)}
            />
            {form.scheduleNext && (
              <>
                <DueDatePicker
                  label="Dia do próximo contato"
                  value={form.nextDate}
                  onChange={form.setNextDate}
                />
                <Input.Text
                  label="Motivo do próximo (opcional)"
                  placeholder={`Ex: ${followUp.reason}`}
                  hint="Em branco, repete o motivo deste contato."
                  maxLength={300}
                  value={form.nextReason}
                  onChange={(e) => form.setNextReason(e.target.value)}
                />
              </>
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
            <Button.Title>Concluir</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
