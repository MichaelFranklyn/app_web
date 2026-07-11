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
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PaymentTermNode, UPDATE_FACTORY_PAYMENT_TERM_MUTATION } from "../gql";
import { formatInstallments, parseInstallments } from "../utils";

interface UpdateResponse {
  updateFactoryPaymentTerm: {
    status: boolean;
    message: string;
    data: PaymentTermNode | null;
  };
}

interface Props {
  term: PaymentTermNode;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<PaymentTermNode>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function EditPaymentTermModal({
  term,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateTerm] = useMutation<UpdateResponse>(
    UPDATE_FACTORY_PAYMENT_TERM_MUTATION
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
                name: "name",
                type: "text",
                label: "Nome do prazo",
                required: true,
                placeholder: "Ex: 30/60/90, À vista",
              },
              {
                name: "installments",
                type: "text",
                label: "Vencimentos (dias)",
                required: true,
                placeholder: "Ex: 30/60/90 — use 0 para à vista",
                hint: "Dias de cada parcela a partir do pedido, separados por / ou vírgula.",
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
      name: term.name,
      installments: formatInstallments(term.installmentsDays),
    }),
    [term]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    const installmentsDays = parseInstallments(String(data.installments ?? ""));

    if (installmentsDays.length === 0) {
      // Mantém aberto: sem vencimentos não há o que salvar.
      return;
    }

    const sameName = name === term.name;
    const sameDays =
      installmentsDays.length === term.installmentsDays.length &&
      installmentsDays.every((d, i) => d === term.installmentsDays[i]);
    if (sameName && sameDays) {
      setOpen(false);
      return;
    }

    setOpen(false);
    onUpdateOptimistic(term.id, { name, installmentsDays });

    await execute(
      async () => {
        const res = await updateTerm({
          variables: { id: term.id, input: { name, installmentsDays } },
        });
        if (
          !res.data?.updateFactoryPaymentTerm?.status ||
          !res.data.updateFactoryPaymentTerm.data
        ) {
          throw new Error(
            res.data?.updateFactoryPaymentTerm?.message ??
              "Erro ao atualizar prazo"
          );
        }
        return res.data.updateFactoryPaymentTerm.data;
      },
      {
        successMessage: "Prazo atualizado com sucesso",
        onSuccess: () => {
          onCommit();
          onChanged();
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
          size="sm"
          isIconOnly
          label="Editar prazo"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar prazo"
          description={`Altere o prazo de pagamento "${term.name}".`}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
