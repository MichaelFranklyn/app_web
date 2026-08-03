"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CREATE_FACTORY_PAYMENT_TERM_MUTATION, PaymentTermNode } from "../gql";
import { parseInstallments } from "../utils";

interface CreateResponse {
  createFactoryPaymentTerm: {
    status: boolean;
    message: string;
    data: PaymentTermNode | null;
  };
}

interface Props {
  companyFactoryId: string;
  onAdded: () => void;
  onAddOptimistic: (term: PaymentTermNode) => void;
}

export function AddPaymentTermModal({
  companyFactoryId,
  onAdded,
  onAddOptimistic,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createTerm] = useMutation<CreateResponse>(
    CREATE_FACTORY_PAYMENT_TERM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "term",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "installments",
                type: "text",
                label: "Vencimentos (dias)",
                required: true,
                placeholder: "Ex: 30/60/90 — use 0 para à vista",
                hint: "Dias de cada parcela a partir do pedido, separados por / ou vírgula.",
              },
              {
                name: "minOrderAmount",
                type: "currency",
                label: "Valor mínimo do pedido (opcional)",
                placeholder: "0,00",
                hint: "Quanto a fábrica exige em mercadoria para liberar este prazo. Deixe em branco se não houver mínimo.",
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
        const installmentsDays = parseInstallments(
          String(data.installments ?? "")
        );
        if (installmentsDays.length === 0) {
          throw new Error("Informe ao menos um vencimento (ex.: 30/60/90).");
        }
        // Campo vazio vira 0 e o back trata como "sem mínimo".
        const minOrderAmount = parseMoneyToNumber(
          String(data.minOrderAmount ?? "")
        );
        // O nome do prazo é derivado dos vencimentos pelo back (ex.: "30/60/90").
        const res = await createTerm({
          variables: {
            input: { companyFactoryId, installmentsDays, minOrderAmount },
          },
        });
        if (
          !res.data?.createFactoryPaymentTerm?.status ||
          !res.data.createFactoryPaymentTerm.data
        ) {
          throw new Error(
            res.data?.createFactoryPaymentTerm?.message ??
              "Erro ao criar prazo de pagamento"
          );
        }
        return res.data.createFactoryPaymentTerm.data;
      },
      {
        successMessage: "Prazo de pagamento criado com sucesso",
        onSuccess: async (created) => {
          handleClose(false);
          onAddOptimistic(created);
          onAdded();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo prazo</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo prazo de pagamento"
          description="Combine os vencimentos das parcelas (ex.: 30/60/90). O prazo fica disponível ao criar pedidos desta fábrica."
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
            <Button.Title>Criar prazo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
