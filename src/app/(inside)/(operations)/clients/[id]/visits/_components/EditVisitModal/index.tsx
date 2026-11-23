"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { VISIT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { UPDATE_VISIT_SCHEDULE_ITEM_MUTATION } from "./gql";
import { EditVisitModalProps, UpdateVisitResponse } from "./interface";
import {
  VISIT_OUTCOME_OPTIONS,
  editVisitFormSteps,
  normalizeVisitInput,
} from "./utils";
import { visitStatusOptionsFor } from "@/utils/visit";

export function EditVisitModal({
  visit,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  open: controlledOpen,
  onOpenChange,
}: EditVisitModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setUncontrolledOpen(value);
  };
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const [updateVisit] = useMutation<UpdateVisitResponse>(
    UPDATE_VISIT_SCHEDULE_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const steps = useMemo(() => editVisitFormSteps(visit.status), [visit.status]);

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
          // `visitSchedules` alimenta a rotina da semana: o mesmo item aparece lá
          // como card. Sem invalidar, voltar para /schedule pode servir o status
          // antigo do cache.
          await invalidateClient(VISIT_CACHE_FIELDS);
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <Modal.Trigger asChild>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            aria-label="Editar visita"
          >
            <Button.Icon icon={Pencil} />
          </Button.Root>
        </Modal.Trigger>
      )}

      <Modal.Content size="md">
        <Modal.Header
          title="Editar visita"
          description="Registre o status, o resultado e as observações da visita."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={{
              status:
                visitStatusOptionsFor(visit.status).find(
                  (o) => o.value === visit.status
                ) ?? null,
              outcome:
                VISIT_OUTCOME_OPTIONS.find((o) => o.value === visit.outcome) ??
                null,
              outcomeReason: visit.outcomeReason ?? "",
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
