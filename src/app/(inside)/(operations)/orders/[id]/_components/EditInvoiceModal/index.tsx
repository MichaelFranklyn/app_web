"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { FileClock, RotateCcw, TriangleAlert } from "lucide-react";

import { OrderDetail } from "../../interface";
import { useEditInvoice } from "./useEditInvoice";

interface Props {
  order: OrderDetail;
  onSuccess: () => void;
}

/**
 * Corrige um faturamento já lançado. As correções leves (data, prazo, previsão
 * e data de entrega) ficam no formulário; as pesadas — desfazer a entrega e
 * refazer o faturamento — pedem confirmação ali mesmo, sem abrir outra janela
 * por cima.
 */
export function EditInvoiceModal({ order, onSuccess }: Props) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    initialData,
    handleSubmit,
    isLoading,
    willDropSettlements,
    settlementSummary,
    hasBackorder,
    pendingAction,
    setPendingAction,
    undoDelivery,
    redoInvoice,
  } = useEditInvoice(order, onSuccess);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={FileClock} />
          <Button.Title>Editar faturamento</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar faturamento"
          description="Corrija o que foi lançado: a data da nota, o prazo de pagamento, a previsão e a data de entrega."
        />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            {willDropSettlements && (
              <Alert.Root variant="warning">
                <Alert.Icon icon={TriangleAlert} />
                <Alert.Content>
                  <Alert.Title>
                    Este prazo muda a quantidade de parcelas
                  </Alert.Title>
                  <Alert.Description>
                    As parcelas serão refeitas do zero, e com elas as baixas já
                    lançadas ({settlementSummary}). Confira antes de salvar.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            <FormBuilder
              ref={formRef}
              steps={steps}
              initialData={initialData}
              onSubmit={handleSubmit}
              loading={isLoading}
              unstyled
            />

            <Divider.Root />

            {/* Faturou cheio e na verdade saiu parcial? Refazer devolve o pedido
                ao estado anterior para ser faturado de novo — inclusive parcial. */}
            {pendingAction === null && (
              <div className="flex flex-col gap-8">
                <Title variant="body-sm" weight="medium">
                  Precisa mudar mais que as datas?
                </Title>
                <Title variant="body-xs" color="muted">
                  Refazer o faturamento apaga as parcelas, traz de volta o que
                  virou pedido de saldo e devolve o pedido para “confirmado” —
                  aí você fatura de novo, com as quantidades certas.
                </Title>
                <div className="flex flex-wrap gap-8">
                  {order.deliveredAt && (
                    <Button.Root
                      type="button"
                      appearance="outline"
                      color="neutral"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => setPendingAction("undoDelivery")}
                    >
                      <Button.Icon icon={RotateCcw} />
                      <Button.Title>Desfazer entrega</Button.Title>
                    </Button.Root>
                  )}
                  <Button.Root
                    type="button"
                    appearance="outline"
                    color="red"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setPendingAction("redoInvoice")}
                  >
                    <Button.Icon icon={RotateCcw} />
                    <Button.Title>Refazer faturamento</Button.Title>
                  </Button.Root>
                </div>
              </div>
            )}

            {pendingAction === "undoDelivery" && (
              <ConfirmBlock
                title="Desfazer a entrega deste pedido?"
                description="O pedido volta para “faturado, aguardando entrega”. As parcelas e a comissão continuam como estão."
                confirmLabel="Desfazer entrega"
                color="neutral"
                isLoading={isLoading}
                onCancel={() => setPendingAction(null)}
                onConfirm={undoDelivery}
              />
            )}

            {pendingAction === "redoInvoice" && (
              <ConfirmBlock
                title="Refazer o faturamento deste pedido?"
                description={[
                  "As parcelas geradas serão apagadas",
                  settlementSummary ? `(incluindo ${settlementSummary})` : "",
                  hasBackorder
                    ? "e o pedido de saldo volta para dentro deste pedido."
                    : "e o pedido volta para “confirmado”.",
                  "Depois é só faturar de novo.",
                ]
                  .filter(Boolean)
                  .join(" ")}
                confirmLabel="Refazer faturamento"
                color="red"
                isLoading={isLoading}
                onCancel={() => setPendingAction(null)}
                onConfirm={redoInvoice}
              />
            )}
          </div>
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
            disabled={pendingAction !== null}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>
              {willDropSettlements ? "Salvar e refazer parcelas" : "Salvar"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

interface ConfirmBlockProps {
  title: string;
  description: string;
  confirmLabel: string;
  color: "red" | "neutral";
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmação no corpo do modal — evita empilhar uma janela sobre a outra. */
function ConfirmBlock({
  title,
  description,
  confirmLabel,
  color,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmBlockProps) {
  return (
    <div className="flex flex-col gap-12 rounded-(--r-md) border border-(--border) bg-(--bg2) p-16">
      <div className="flex flex-col gap-4">
        <Title variant="body-sm" weight="medium">
          {title}
        </Title>
        <Title variant="body-xs" color="muted">
          {description}
        </Title>
      </div>
      <div className="flex gap-8">
        <Button.Root
          type="button"
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          disabled={isLoading}
          onClick={onCancel}
        >
          <Button.Title>Cancelar</Button.Title>
        </Button.Root>
        <Button.Root
          type="button"
          appearance="solid"
          color={color}
          size="sm"
          noUppercase
          loading={isLoading}
          onClick={onConfirm}
        >
          <Button.Title>{confirmLabel}</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
