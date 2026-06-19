"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { VisitScheduleItem } from "../../interface";
import {
  RESCHEDULE_REASON_OPTIONS,
  formatDayLabel,
  formatWeekdayLabel,
} from "../../utils";
import { RESCHEDULE_VISIT_MUTATION } from "./gql";

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: unknown }).value)
    : String(raw ?? "");

interface Props {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: { id: string; date: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

export function RescheduleVisitModal({
  item,
  currentDayId,
  scheduleDays,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [rescheduleVisit] = useMutation(RESCHEDULE_VISIT_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const client = item.clientFactoryLink?.client;
  const clientName = client?.nomeFantasia ?? client?.razaoSocial ?? "Cliente";

  const dayOptions = useMemo(
    () =>
      scheduleDays
        .filter((d) => d.id !== currentDayId)
        .map((d) => ({
          value: d.id,
          label: `${formatDayLabel(d.date)} · ${formatWeekdayLabel(d.date)}`,
        })),
    [scheduleDays, currentDayId]
  );

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
                name: "targetDayId",
                type: "select-single",
                label: "Remarcar para",
                placeholder:
                  dayOptions.length === 0
                    ? "Sem outros dias na semana — marca como falha"
                    : "Escolha o dia (vazio = marcar falha)",
                options: dayOptions,
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
    [dayOptions]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const reason = extractValue(data.reason);
    if (!reason) return;
    const targetDayId = extractValue(data.targetDayId);
    const notes = String(data.notes ?? "").trim();
    const input: Record<string, unknown> = { originalItemId: item.id, reason };
    if (targetDayId) input.targetDayId = targetDayId;
    if (notes) input.notes = notes;

    await execute(
      async () => {
        const res = await rescheduleVisit({ variables: { input } });
        const payload = (
          res.data as { rescheduleVisit?: { status: boolean; message: string } }
        )?.rescheduleVisit;
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
