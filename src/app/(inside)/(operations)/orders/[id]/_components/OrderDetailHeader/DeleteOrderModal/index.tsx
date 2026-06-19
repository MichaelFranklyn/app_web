"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useNavigation } from "@/hooks/useNavigation";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_ORDER_MUTATION } from "./gql";
import { DeleteOrderModalProps, DeleteOrderResponse } from "./interface";

export function DeleteOrderModal({ orderId }: DeleteOrderModalProps) {
  const [open, setOpen] = useState(false);
  const { navigateTo } = useNavigation();
  const { toast } = useToast();
  const client = useApolloClient();

  const [deleteOrder] = useMutation<DeleteOrderResponse>(DELETE_ORDER_MUTATION);

  const handleConfirm = () => {
    deleteOrder({ variables: { id: orderId } })
      .then((res) => {
        if (!res.data?.deleteOrder?.status) {
          toast({
            variant: "error",
            title: "Erro",
            description:
              res.data?.deleteOrder?.message ?? "Erro ao excluir pedido",
          });
          return;
        }
        // A lista é cache-first: invalidamos só o CAMPO da listagem (na raiz
        // da query) para forçar um refetch sem o pedido excluído ao voltar.
        // Não removemos a entidade OrderType: isso dispararia um refetch do
        // detalhe (order(id)) ainda montado, que retornaria NotFound.
        client.cache.evict({ id: "ROOT_QUERY", fieldName: "orders" });
        client.cache.evict({ id: "ROOT_QUERY", fieldName: "orders_list" });
        // KPIs (query client-side) também precisam refletir o pedido removido.
        client.cache.evict({ id: "ROOT_QUERY", fieldName: "orderStats" });
        client.cache.gc();
        toast({
          variant: "success",
          title: "Sucesso",
          description: "Pedido excluído com sucesso",
        });
        navigateTo("/orders");
      })
      .catch((error) => {
        toast({
          variant: "error",
          title: "Erro",
          description:
            error instanceof Error ? error.message : "Erro ao excluir pedido",
        });
      });
    setOpen(false);
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
            onClick={handleConfirm}
          >
            <Button.Title>Confirmar exclusão</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
