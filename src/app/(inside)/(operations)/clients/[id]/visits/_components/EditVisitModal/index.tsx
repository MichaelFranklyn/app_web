"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UPDATE_VISIT_SCHEDULE_ITEM_MUTATION } from "./gql";
import { EditVisitModalProps, UpdateVisitResponse } from "./interface";
import {
  EDIT_VISIT_FORM_STEPS,
  STOCK_OBS_OPTIONS,
  VISIT_OUTCOME_OPTIONS,
  VISIT_STATUS_OPTIONS,
  normalizeVisitInput,
} from "./utils";

export function EditVisitModal({
  visit,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: EditVisitModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const [updateVisit] = useMutation<UpdateVisitResponse>(
    UPDATE_VISIT_SCHEDULE_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalizeVisitInput(data, visit);

    if (Object.keys(input).length === 0) {
      setOpen(false);
      return;
    }

    setOpen(false);
    onUpdateOptimistic(visit.id, input);

    await execute(
      async () => {
        const res = await updateVisit({ variables: { id: visit.id, input } });

        if (!res.data?.updateVisitScheduleItem?.status) {
          throw new Error(
            res.data?.updateVisitScheduleItem?.message ??
              "Erro ao atualizar visita"
          );
        }
        return res.data.updateVisitScheduleItem.data;
      },
      {
        successMessage: "Visita atualizada",
        onSuccess: async () => {
          formRef.current?.resetForm();
          onCommit();
          await invalidateClient(["visitsBySellerClientFactory"]);
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="xs"
          aria-label="Editar visita"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar visita"
          description="Registre o status, o resultado e as observações da visita."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={EDIT_VISIT_FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={{
              status:
                VISIT_STATUS_OPTIONS.find((o) => o.value === visit.status) ??
                null,
              outcome:
                VISIT_OUTCOME_OPTIONS.find((o) => o.value === visit.outcome) ??
                null,
              outcomeReason: visit.outcomeReason ?? "",
              stockObservation:
                STOCK_OBS_OPTIONS.find(
                  (o) => o.value === visit.stockObservation
                ) ?? null,
              notes: visit.notes ?? "",
            }}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
