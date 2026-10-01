"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Ban } from "lucide-react";
import { useState } from "react";

const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($id: UUID!, $input: CancelOrderInput) {
    cancelOrder(id: $id, input: $input) {
      status
      message
      data {
        id
        status
        cancelledAt
        cancelledByName
        cancelReason
      }
    }
  }
`;

interface CancelOrderResponse {
  cancelOrder: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  orderId: string;
  /** Orçamento ou pedido: muda só as palavras do modal. */
  isQuote: boolean;
  onSuccess: () => void;
}

/** Mesmo teto do backend (`MAX_REASON_LENGTH`). */
const MAX_REASON_LENGTH = 500;

/**
 * Cancela o pedido SEM excluir. Ele continua na lista, marcado como cancelado,
 * com o motivo — e sai dos números de venda.
 *
 * Só aparece antes do faturamento: faturado tem boletos e comissão, e o caminho
 * é desfazer o faturamento primeiro (o backend recusa e diz isso).
 */
export function CancelOrderModal({ orderId, isQuote, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelOrder] = useMutation<CancelOrderResponse>(CANCEL_ORDER_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const noun = isQuote ? "orçamento" : "pedido";

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await cancelOrder({
          variables: { id: orderId, input: { reason: reason.trim() || null } },
        });
        if (!res.data?.cancelOrder?.status) {
          throw new Error(
            res.data?.cancelOrder?.message ?? "Erro ao cancelar o pedido"
          );
        }
        return res.data.cancelOrder;
      },
      {
        successMessage: (r) => r?.message ?? "Pedido cancelado.",
        onSuccess: () => {
          setOpen(false);
          setReason("");
          onSuccess();
          // Cancelado sai dos KPIs de /orders e dos números da ficha do cliente.
          void invalidateClient(ORDER_CACHE_FIELDS);
        },
      }
    );
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setReason("");
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Ban} />
          <Button.Title>Cancelar {noun}</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title={`Cancelar ${noun}`}
          description={`O ${noun} não é apagado: continua na lista de pedidos, marcado como cancelado, para você saber o que aconteceu com ele.`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Alert.Root variant="warning">
              <Alert.Content>
                <Alert.Title>Ele deixa de contar nas vendas</Alert.Title>
                <Alert.Description>
                  Pedido cancelado não entra nos totais, nas metas nem nos
                  relatórios, e não pode mais ser faturado. Cancelar não pode
                  ser desfeito.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>

            <Input.Textarea
              label="Motivo (opcional)"
              hint="Fica registrado no pedido, junto com a data e o seu nome."
              placeholder="Ex: cliente desistiu da compra"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={MAX_REASON_LENGTH}
              rows={3}
            />
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
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Confirmar cancelamento</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
