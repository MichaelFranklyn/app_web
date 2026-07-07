"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { getTodayIso, toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { BadgeCheck } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { MARK_COMMISSION_RECEIVED_MUTATION } from "../../gql";

interface MarkResponse {
  markCommissionReceived: { status: boolean; message: string };
}

interface Props {
  installmentIds: string[];
  label?: string;
  onSuccess: () => void;
}

export function MarkReceivedModal({
  installmentIds,
  label = "Recebi",
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [markReceived] = useMutation<MarkResponse>(
    MARK_COMMISSION_RECEIVED_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "receive",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "receivedAt",
                type: "date",
                label: "Data do recebimento",
                required: true,
                hint: "Dia em que a fábrica repassou a comissão.",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (installmentIds.length === 0) return;
    await execute(
      async () => {
        const receivedAt = toIsoDate(data.receivedAt);
        if (!receivedAt) throw new Error("Informe a data do recebimento.");
        const res = await markReceived({
          variables: { installmentIds, receivedAt },
        });
        if (!res.data?.markCommissionReceived?.status) {
          throw new Error(
            res.data?.markCommissionReceived?.message ??
              "Erro ao marcar comissão como recebida"
          );
        }
        return res.data.markCommissionReceived;
      },
      {
        successMessage: "Comissão marcada como recebida",
        onSuccess: () => {
          handleClose(false);
          onSuccess();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="green" size="sm">
          <Button.Icon icon={BadgeCheck} />
          <Button.Title>{label}</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title="Marcar comissão como recebida"
          description={
            installmentIds.length > 1
              ? `Confirma o recebimento de ${installmentIds.length} comissões.`
              : "Confirma que a fábrica repassou esta comissão."
          }
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={{ receivedAt: getTodayIso() }}
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
            <Button.Title>Confirmar recebimento</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
