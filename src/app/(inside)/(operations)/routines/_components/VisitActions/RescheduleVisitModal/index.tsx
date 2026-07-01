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
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { RESCHEDULE_REASON_OPTIONS } from "../../../utils";
import { RESCHEDULE_VISIT_MUTATION } from "../gql";
import {
  RescheduleVisitModalProps,
  RescheduleVisitResponse,
} from "./interface";

export function RescheduleVisitModal({
  item,
  open,
  onOpenChange,
  onDone,
}: RescheduleVisitModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const [rescheduleVisit] = useMutation<RescheduleVisitResponse>(
    RESCHEDULE_VISIT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const client = item.clientFactoryLink?.client;
  const clientName = client?.nomeFantasia ?? client?.razaoSocial ?? "Cliente";

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "reschedule",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "reason",
                type: "select-single",
                label: "Motivo",
                required: true,
                placeholder: "Por que está remarcando?",
                options: RESCHEDULE_REASON_OPTIONS,
              },
              {
                name: "targetDate",
                type: "date",
                label: "Nova data da visita",
                hint: "Escolha o dia em que pretende visitar. A rotina daquela semana é criada se ainda não existir. Deixe em branco para encaixar no próximo dia disponível.",
              },
              {
                name: "notes",
                type: "textarea",
                label: "Observações",
                placeholder: "Detalhes da remarcação",
                rows: 3,
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const reason = extractSelectValue(data.reason);
    if (!reason) return;
    const targetDate = toIsoDate(data.targetDate);
    const notes = String(data.notes ?? "").trim();
    const input: Record<string, unknown> = { originalItemId: item.id, reason };
    if (targetDate) input.targetDate = targetDate;
    if (notes) input.notes = notes;

    await execute(
      async () => {
        const res = await rescheduleVisit({ variables: { input } });
        const payload = res.data?.rescheduleVisit;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao remarcar visita");
        }
        return payload;
      },
      {
        successMessage: "Visita remarcada",
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
          title={`Remarcar visita · ${clientName}`}
          description="Escolha o motivo e o novo dia da visita."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
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
            <Button.Title>Remarcar visita</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
