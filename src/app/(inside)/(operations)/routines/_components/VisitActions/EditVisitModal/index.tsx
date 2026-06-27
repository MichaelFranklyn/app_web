"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { VISIT_OUTCOME_OPTIONS, VISIT_STATUS_OPTIONS } from "../../../utils";
import { UPDATE_VISIT_ITEM_MUTATION } from "../gql";
import {
  EditVisitModalProps,
  UpdateVisitScheduleItemResponse,
} from "./interface";

export function EditVisitModal({
  item,
  open,
  onOpenChange,
  onDone,
}: EditVisitModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateItem] = useMutation<UpdateVisitScheduleItemResponse>(
    UPDATE_VISIT_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const client = item.clientFactoryLink?.client;
  const factory = item.clientFactoryLink?.factory;
  const clientName = client?.nomeFantasia ?? client?.razaoSocial ?? "Cliente";
  const factoryName = factory?.nomeFantasia ?? factory?.razaoSocial ?? "—";

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
                label: "Resultado",
                placeholder: "Opcional",
                options: VISIT_OUTCOME_OPTIONS,
              },
              {
                name: "notes",
                type: "textarea",
                label: "Observações",
                placeholder: "Anotações sobre a visita",
                rows: 3,
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(
    () => ({
      status: VISIT_STATUS_OPTIONS.find((o) => o.value === item.status) ?? null,
      outcome:
        VISIT_OUTCOME_OPTIONS.find((o) => o.value === item.outcome) ?? null,
      notes: item.notes ?? "",
    }),
    [item]
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
          throw new Error(payload?.message ?? "Erro ao salvar visita");
        }
        return payload;
      },
      {
        successMessage: "Visita atualizada",
        onSuccess: () => {
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={`Editar visita · ${clientName}`}
          description={`${factoryName} · visita #${item.plannedOrder}`}
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
