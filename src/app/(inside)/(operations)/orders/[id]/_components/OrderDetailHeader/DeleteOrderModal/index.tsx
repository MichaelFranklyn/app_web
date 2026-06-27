"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useNavigation } from "@/hooks/useNavigation";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_ORDER_MUTATION } from "./gql";
import { DeleteOrderModalProps, DeleteOrderResponse } from "./interface";

export function DeleteOrderModal({ orderId }: DeleteOrderModalProps) {
  const [open, setOpen] = useState(false);
  const { navigateTo } = useNavigation();
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const [deleteOrder] = useMutation<DeleteOrderResponse>(DELETE_ORDER_MUTATION);

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteOrder({ variables: { id: orderId } });

        if (!res.data?.deleteOrder?.status) {
          throw new Error(
            res.data?.deleteOrder?.message ?? "Erro ao excluir pedido"
          );
        }

        return res.data.deleteOrder;
      },
      {
        successMessage: "Pedido excluído com sucesso",
        onSuccess: async () => {
          // Invalida só os CAMPOS de listagem/KPIs (a lista é cache-first, então
          // refaz o fetch sem o pedido excluído ao voltar). Não removemos a
          // entidade OrderType: isso dispararia um refetch do detalhe (order(id))
          // ainda montado, que retornaria NotFound.
          await invalidateClient(["orders", "orders_list", "orderStats"]);
          setOpen(false);
          navigateTo("/orders");
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Trash2} />
          <Button.Title>Deletar pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title="Deletar pedido"
          description="Esta ação não pode ser desfeita. O pedido e todos os seus itens serão excluídos permanentemente."
        />

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
            <Button.Title>Confirmar exclusão</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
