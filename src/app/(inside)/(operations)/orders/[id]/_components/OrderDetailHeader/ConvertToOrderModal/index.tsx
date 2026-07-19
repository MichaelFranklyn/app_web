"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { ArrowRightLeft } from "lucide-react";

// Operação própria (nome distinto de UpdateOrder) para converter um orçamento em
// pedido de fato: reaproveita a mutation updateOrder mudando só o status.
const CONVERT_QUOTE_MUTATION = gql`
  mutation ConvertQuoteToOrder($id: UUID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      status
      message
      data {
        id
        status
      }
    }
  }
`;

interface ConvertResponse {
  updateOrder: {
    status: boolean;
    message: string;
    data: { id: string; status: string } | null;
  };
}

interface Props {
  orderId: string;
  onSuccess: () => void;
}

export function ConvertToOrderModal({ orderId, onSuccess }: Props) {
  const [convert] = useMutation<ConvertResponse>(CONVERT_QUOTE_MUTATION);

  return (
    <ConfirmModal
      title="Converter orçamento em pedido"
      description="O orçamento passa a ser um pedido de fato e poderá ser faturado. Esta ação não pode ser desfeita."
      confirmLabel="Converter em pedido"
      confirmColor="amber"
      successMessage="Orçamento convertido em pedido"
      onSuccess={onSuccess}
      onConfirm={async () => {
        const res = await convert({
          variables: { id: orderId, input: { status: "CONFIRMED" } },
        });
        if (!res.data?.updateOrder?.status || !res.data.updateOrder.data) {
          throw new Error(
            res.data?.updateOrder?.message ?? "Erro ao converter orçamento"
          );
        }
      }}
      trigger={
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={ArrowRightLeft} />
          <Button.Title>Converter em pedido</Button.Title>
        </Button.Root>
      }
    />
  );
}
