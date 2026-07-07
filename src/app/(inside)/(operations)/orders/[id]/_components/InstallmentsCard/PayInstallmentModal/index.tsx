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
import { CircleDollarSign } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PAY_ORDER_INSTALLMENT_MUTATION } from "../../../gql";

interface PayResponse {
  payOrderInstallment: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  installmentId: string;
  sequence: number;
  onSuccess: () => void;
}

export function PayInstallmentModal({
  installmentId,
  sequence,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [payInstallment] = useMutation<PayResponse>(
    PAY_ORDER_INSTALLMENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "pay",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "paidAt",
                type: "date",
                label: "Data do pagamento",
                required: true,
                hint: "Dia em que o cliente pagou o boleto. Define quando a comissão desta parcela fica a receber.",
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
    await execute(
      async () => {
        const paidAt = toIsoDate(data.paidAt);
        if (!paidAt) throw new Error("Informe a data do pagamento.");
        const res = await payInstallment({
          variables: { id: installmentId, paidAt },
        });
        if (!res.data?.payOrderInstallment?.status) {
          throw new Error(
            res.data?.payOrderInstallment?.message ??
              "Erro ao registrar pagamento"
          );
        }
        return res.data.payOrderInstallment;
      },
      {
        successMessage: `Parcela ${sequence} marcada como paga`,
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
          <Button.Icon icon={CircleDollarSign} />
          <Button.Title>Pago</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title={`Marcar parcela ${sequence} como paga`}
          description="Registra o pagamento do boleto pelo cliente."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={{ paidAt: getTodayIso() }}
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
            <Button.Title>Confirmar pagamento</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
