"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useRef } from "react";

import { FollowUpModalProps } from "./interface";
import { useFollowUpForm } from "./useFollowUpForm";

/**
 * Agendar (ou corrigir) o próximo contato com um cliente.
 *
 * Mora em `components/` porque é a MESMA ficha aberta de quatro lugares: a
 * lista de contatos, a aba do cliente, o pedido e o próprio agendamento.
 *
 * O dia não se corrige aqui: mudar de dia é "Reagendar", no agendamento —
 * é o que deixa a data antiga na linha do tempo.
 */
export function FollowUpModal({
  open,
  onOpenChange,
  followUp,
  clientId,
  clientName,
  orderId,
  orderLabel,
  returnItemId,
  returnLabel,
  defaultDueDate,
  defaultResponsible,
  onSaved,
}: FollowUpModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const form = useFollowUpForm({
    open,
    onOpenChange,
    followUp,
    clientId,
    orderId,
    orderLabel,
    returnItemId,
    defaultDueDate,
    defaultResponsible,
    onSaved,
  });

  const subject = [clientName, orderLabel ? `pedido de ${orderLabel}` : null]
    .filter(Boolean)
    .join(", ");
  const description = form.isEditing
    ? "Corrija o motivo, as observações, o pedido ou quem vai fazer o contato. Para mudar o dia, use Reagendar."
    : subject
      ? `Quando voltar a falar com ${subject}, e por quê.`
      : "Quando voltar a falar com o cliente, e por quê.";
  // Veio de um "volte dia X": dizer que concluir este contato resolve aquele.
  const linkedNote =
    !form.isEditing && returnLabel
      ? ` Ele atende o retorno combinado para ${returnLabel}.`
      : "";

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header
          title={
            form.isEditing ? "Corrigir contato agendado" : "Agendar contato"
          }
          description={description + linkedNote}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={form.steps}
            initialData={form.initialValues}
            onSubmit={form.submit}
            loading={form.isLoading}
            unstyled
          />
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
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={form.isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>{form.isEditing ? "Salvar" : "Agendar"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
