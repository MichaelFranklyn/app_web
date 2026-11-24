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
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PaymentTermNode, UPDATE_FACTORY_PAYMENT_TERM_MUTATION } from "../gql";
import {
  formatInstallments,
  parseInstallments,
  TierOption,
  tierFieldValue,
  tierFormFields,
  tierIdFromField,
} from "../utils";

interface UpdateResponse {
  updateFactoryPaymentTerm: {
    status: boolean;
    message: string;
    data: PaymentTermNode | null;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  term: PaymentTermNode;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<PaymentTermNode>) => void;
  onCommit: () => void;
  onRollback: () => void;
  /** Níveis da fábrica; vazio = fábrica de um nível só, sem o campo. */
  tiers: TierOption[];
}

export function EditPaymentTermModal({
  term,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  tiers,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setUncontrolledOpen(value);
  };
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
                label: "Valor mínimo do pedido",
                placeholder: "0,00",
                hint: "Quanto a fábrica exige em mercadoria para liberar este prazo. Zere o campo para deixar o prazo sem mínimo.",
              },
              ...tierFormFields(tiers),
            ],
          },
        ],
      },
    ],
    [tiers]
  );

  const initialData = useMemo(
    () => ({
      installments: formatInstallments(term.installmentsDays),
      minOrderAmount: term.minOrderAmount
        ? maskCurrency(String(Math.round(term.minOrderAmount * 100)))
        : "",
      ...(tiers.length
        ? { priceTierId: tierFieldValue(term.priceTierId, tiers) }
        : {}),
    }),
    [term, tiers]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const installmentsDays = parseInstallments(String(data.installments ?? ""));

    if (installmentsDays.length === 0) {
      // Mantém aberto: sem vencimentos não há o que salvar.
      return;
    }

    const sameDays =
      installmentsDays.length === term.installmentsDays.length &&
      installmentsDays.every((d, i) => d === term.installmentsDays[i]);

    // Campo vazio vira 0, que é como o back recebe o pedido de remover o piso —
    // e é diferente de "não enviar" (que significaria manter o que está lá).
    const minOrderAmount = parseMoneyToNumber(
      String(data.minOrderAmount ?? "")
    );
    const sameMinimum = minOrderAmount === (term.minOrderAmount ?? 0);

    // Sem o campo (fábrica de um nível só), o nível fica como está.
    const priceTierId = tiers.length
      ? tierIdFromField(extractSelectValue(data.priceTierId))
      : term.priceTierId;
    const sameTier = priceTierId === term.priceTierId;

    if (sameDays && sameMinimum && sameTier) {
      setOpen(false);
      return;
    }

    // O nome acompanha os vencimentos (derivado no back).
    const name = formatInstallments(installmentsDays);

    setOpen(false);
    onUpdateOptimistic(term.id, {
      name,
      installmentsDays,
      minOrderAmount: minOrderAmount || null,
      priceTierId,
    });

    await execute(
      async () => {
        const res = await updateTerm({
          variables: {
            id: term.id,
            // null no update é "não mexer": desvincular precisa do flag.
            input: {
              installmentsDays,
              minOrderAmount,
              ...(sameTier
                ? {}
                : priceTierId
                  ? { priceTierId }
                  : { clearPriceTier: true }),
            },
          },
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
      {!isControlled && (
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
      )}

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
