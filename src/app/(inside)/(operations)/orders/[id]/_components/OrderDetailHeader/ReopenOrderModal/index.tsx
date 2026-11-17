"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import { formatDateDMY } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { OrderDetail } from "../../../interface";
import { REOPEN_ORDER_MUTATION } from "./gql";

interface ReopenOrderResponse {
  reopenCancelledOrder: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  order: OrderDetail;
  onSuccess: () => void;
  /** Sempre aberto pelo menu "Mais ações". */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mesmos limites do backend (`reopen_cancelled_order.py`). */
const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

/**
 * Desfaz o cancelamento: o MESMO pedido volta ao ponto em que estava (número,
 * data e itens intactos). Só o gestor vê a ação, e o motivo é obrigatório —
 * fica no histórico do pedido.
 */
export function ReopenOrderModal({
  order,
  onSuccess,
  open,
  onOpenChange,
}: Props) {
  const [reason, setReason] = useState("");
  const [reopenOrder] = useMutation<ReopenOrderResponse>(REOPEN_ORDER_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH;

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) setReason("");
  };

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await reopenOrder({
          variables: { id: order.id, input: { reason: reason.trim() } },
        });
        if (!res.data?.reopenCancelledOrder?.status) {
          throw new Error(
            res.data?.reopenCancelledOrder?.message ??
              "Erro ao reabrir o pedido"
          );
        }
        return res.data.reopenCancelledOrder;
      },
      {
        successMessage: () => "Pedido reaberto.",
        onSuccess: () => {
          handleOpenChange(false);
          onSuccess();
          // Volta a contar nas vendas: KPIs de /orders e números da ficha.
          void invalidateClient(ORDER_CACHE_FIELDS);
        },
      }
    );
  };

  const cancelledWhen = order.cancelledAt
    ? ` em ${formatDateDMY(order.cancelledAt)}`
    : "";

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Reabrir pedido"
          description={`Este pedido foi cancelado${cancelledWhen}. Reabrir traz o mesmo pedido de volta, com o número, a data e os itens que ele já tinha.`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Alert.Root variant="info">
              <Alert.Content>
                <Alert.Title>Ele volta a contar nas vendas</Alert.Title>
                <Alert.Description>
                  O pedido retorna à etapa em que estava antes de ser cancelado
                  e entra de novo nos totais, nas metas e nos relatórios. O
                  vendedor é avisado.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>

            <Input.Textarea
              label="Motivo"
              required
              hint="Fica no histórico do pedido, junto com a data e o seu nome."
              placeholder="Ex: o cliente ligou e confirmou a compra"
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
              disabled={isLoading}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            loading={isLoading}
            disabled={!isReasonValid}
            onClick={handleConfirm}
          >
            <Button.Title>Reabrir pedido</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
