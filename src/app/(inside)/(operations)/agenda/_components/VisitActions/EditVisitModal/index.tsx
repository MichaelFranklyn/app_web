"use client";

import { Button } from "@/components/Button";
import { factoryName } from "@/utils/company";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { clientDisplayName } from "@/utils/client";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { VISIT_STATUS_OPTIONS } from "../../../utils";
import { contactLabel, contactNoun, outcomeOptionsFor } from "@/utils/visit";
import { UPDATE_VISIT_ITEM_MUTATION } from "../../../gql";
import {
  EditVisitModalProps,
  UpdateVisitScheduleItemResponse,
} from "./interface";

export function EditVisitModal({
  item,
  open,
  onOpenChange,
  onDone,
  onCompleted,
}: EditVisitModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateItem] = useMutation<UpdateVisitScheduleItemResponse>(
    UPDATE_VISIT_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const client = item.clientFactoryLink?.client;
  const factory = item.clientFactoryLink?.factory;
  const clientName = clientDisplayName(client, "Cliente");
  const factoryLabel = factoryName(factory);
  const isRemote = item.contactType === "REMOTE";
  const noun = contactNoun(item.contactType);
  // No contato remoto o resultado que interessa é a resposta do cliente sobre
  // visita — é ela que antecipa ou adia a próxima ida (o back lê e agenda).
  const outcomeOptions = useMemo(
    () => outcomeOptionsFor(item.contactType),
    [item.contactType]
  );

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "edit",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "status",
                type: "select-single",
                label: "Status",
                required: true,
                placeholder: "Selecione o status",
                options: VISIT_STATUS_OPTIONS,
              },
              {
                name: "outcome",
                type: "select-single",
                label: isRemote ? "O que o cliente disse" : "Resultado",
                placeholder: "Opcional",
                options: outcomeOptions,
              },
              {
                name: "notes",
                type: "textarea",
                label: "Observações",
                placeholder: `Anotações sobre ${isRemote ? "o contato" : "a visita"}`,
                rows: 3,
              },
            ],
          },
        ],
      },
    ],
    [isRemote, outcomeOptions]
  );

  const initialData = useMemo(
    () => ({
      status: VISIT_STATUS_OPTIONS.find((o) => o.value === item.status) ?? null,
      outcome: outcomeOptions.find((o) => o.value === item.outcome) ?? null,
      notes: item.notes ?? "",
    }),
    [item, outcomeOptions]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input: Record<string, unknown> = {};
    const status = extractSelectValue(data.status);
    if (status) input.status = status;
    const outcome = extractSelectValue(data.outcome);
    if (outcome) input.outcome = outcome;
    const notes = String(data.notes ?? "").trim();
    if (notes) input.notes = notes;

    await execute(
      async () => {
        const res = await updateItem({ variables: { id: item.id, input } });
        const payload = res.data?.updateVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? `Erro ao salvar ${noun}`);
        }
        return payload;
      },
      {
        successMessage: `${contactLabel(item.contactType)} atualizad${isRemote ? "o" : "a"}`,
        onSuccess: () => {
          onOpenChange(false);
          onDone();
          // Acabou de virar concluída aqui → oferece pedido/estoque.
          if (status === "COMPLETED" && item.status !== "COMPLETED") {
            onCompleted?.();
          }
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={`Editar ${noun} · ${clientName}`}
          description={`${factoryLabel} · ${noun} #${item.plannedOrder}`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
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
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar alterações</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
