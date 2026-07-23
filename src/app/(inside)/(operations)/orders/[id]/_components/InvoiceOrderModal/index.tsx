"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { getTodayIso, toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { FileCheck2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { INVOICE_ORDER_MUTATION } from "../../gql";
import { OrderDetail } from "../../interface";
import { isPaymentBasis, selectValue } from "../../utils";
import { PartialItemsSection } from "./PartialItemsSection";
import { usePartialInvoice } from "./usePartialInvoice";

interface InvoiceResponse {
  invoiceOrder: {
    status: boolean;
    message: string;
    data: { id: string; backorderChildren: { id: string }[] } | null;
  };
}

interface Props {
  order: OrderDetail;
  onSuccess: () => void;
}

export function InvoiceOrderModal({ order, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [invoiceOrder] = useMutation<InvoiceResponse>(INVOICE_ORDER_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const { toast } = useToast();
  const partialApi = usePartialInvoice(order.id, open);

  const paymentMode = isPaymentBasis(order.commissionCalcBasis);

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "invoice",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "invoicedAt",
                type: "date",
                label: "Data do faturamento",
                required: true,
                hint: "Data em que a fábrica faturou o pedido. As parcelas contam a partir dela.",
              },
              {
                name: "paymentTermId",
                type: "select-single",
                label: "Prazo de pagamento",
                required: paymentMode,
                placeholder:
                  order.availablePaymentTerms.length > 0
                    ? "Selecione o prazo (ex.: 30/60/90)"
                    : "Nenhum prazo cadastrado nesta fábrica",
                hint: paymentMode
                  ? "Obrigatório: a comissão é liberada por parcela paga."
                  : "Opcional: sem prazo, o pedido é faturado à vista.",
                options: order.availablePaymentTerms.map((term) => ({
                  label: `${term.name} (${term.installmentsDays.join("/")})`,
                  value: term.id,
                })),
              },
            ],
          },
        ],
      },
    ],
    [paymentMode, order.availablePaymentTerms]
  );

  const initialData = useMemo(
    () => ({
      invoicedAt: getTodayIso(),
      paymentTermId: order.paymentTermId ?? undefined,
    }),
    [order.paymentTermId]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      partialApi.reset();
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const invoicedAt = toIsoDate(data.invoicedAt);
        if (!invoicedAt) throw new Error("Informe a data do faturamento.");
        const paymentTermId = selectValue(data.paymentTermId) || null;
        if (paymentMode && !paymentTermId) {
          throw new Error("Selecione um prazo de pagamento para faturar.");
        }
        const items = partialApi.buildItemsInput();
        if (items && !partialApi.validation.ok) {
          throw new Error(partialApi.validation.error);
        }
        const res = await invoiceOrder({
          variables: {
            id: order.id,
            input: { invoicedAt, paymentTermId, ...(items ? { items } : {}) },
          },
        });
        if (!res.data?.invoiceOrder?.status) {
          throw new Error(
            res.data?.invoiceOrder?.message ?? "Erro ao faturar o pedido"
          );
        }
        return res.data.invoiceOrder;
      },
      {
        successMessage: (res) =>
          res?.data?.backorderChildren?.length
            ? "Faturado parcial. O restante virou um novo pedido (backorder)."
            : "Pedido faturado. Parcelas geradas.",
        onSuccess: (res) => {
          handleClose(false);
          onSuccess();
          if (res?.data?.backorderChildren?.length) {
            toast({
              variant: "info",
              title: "Pedido de backorder criado",
              description:
                "O que faltou virou um novo pedido pendente. Fature-o quando a fábrica repuser o estoque.",
            });
          }
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={FileCheck2} />
          <Button.Title>Faturar pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Faturar pedido"
          description="Registra o faturamento e gera as parcelas do prazo escolhido. É o marco que libera a comissão."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
          {partialApi.items.length > 0 && (
            <div className="mt-16">
              <PartialItemsSection
                items={partialApi.items}
                partial={partialApi.partial}
                onPartialChange={partialApi.setPartial}
                quantities={partialApi.quantities}
                onQuantityChange={partialApi.setQuantity}
                backorderCount={partialApi.backorderCount}
              />
            </div>
          )}
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
            <Button.Title>Faturar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
