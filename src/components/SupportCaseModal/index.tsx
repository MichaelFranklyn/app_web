"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useRef } from "react";

import { SupportCaseModalProps } from "./interface";
import { useSupportCaseForm } from "./useSupportCaseForm";

/**
 * Registrar (ou corrigir) um atendimento do cliente.
 *
 * Compartilhado entre a fila do escritório (`/support`), o caso aberto e a aba
 * do cliente — as três telas de onde alguém abre uma tratativa. Mora em
 * `components/` por isso: é a MESMA ficha preenchida de lugares distantes.
 *
 * A SITUAÇÃO do caso não se muda aqui, de propósito: mudar de "aberto" para
 * "resolvido" sem dizer o que aconteceu é o que transforma a linha do tempo num
 * status sem história. Quem muda situação é o andamento, no caso aberto.
 */
export function SupportCaseModal({
  open,
  onOpenChange,
  supportCase,
  clientId,
  clientName,
  onSaved,
}: SupportCaseModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const form = useSupportCaseForm({
    open,
    onOpenChange,
    supportCase,
    clientId,
    onSaved,
  });

  const title = form.isEditing
    ? "Corrigir atendimento"
    : "Registrar atendimento";
  const description = form.isEditing
    ? "Corrija o que se descobriu depois: a fábrica, a nota, o valor."
    : clientName
      ? `Um problema que ${clientName} relatou. Os andamentos entram depois, no caso.`
      : "Um problema que o cliente relatou. Os andamentos entram depois, no caso.";

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header title={title} description={description} />
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
            <Button.Title>
              {form.isEditing ? "Salvar" : "Registrar"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
