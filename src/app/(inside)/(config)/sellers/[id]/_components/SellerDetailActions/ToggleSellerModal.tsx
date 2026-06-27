"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";

import { SellerDetail } from "../../interface";
import { TOGGLE_SELLER_MUTATION } from "./gql";

interface SellerMutationResponse {
  updateSeller: {
    status: boolean;
    message: string;
  } | null;
}

interface Props {
  seller: SellerDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

export function ToggleSellerModal({
  seller,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const [toggleSeller] = useMutation<SellerMutationResponse>(
    TOGGLE_SELLER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleToggle = async () => {
    await execute(
      async () => {
        const res = await toggleSeller({
          variables: { id: seller.id, input: { isActive: !seller.isActive } },
        });
        if (!res.data?.updateSeller?.status) {
          throw new Error(
            res.data?.updateSeller?.message ?? "Erro ao atualizar"
          );
        }
        return res.data.updateSeller;
      },
      {
        successMessage: seller.isActive
          ? "Vendedor desativado com sucesso"
          : "Vendedor ativado com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={seller.isActive ? "Desativar vendedor" : "Ativar vendedor"}
          description={`Tem certeza que deseja ${seller.isActive ? "desativar" : "ativar"} o vendedor "${seller.name}"?`}
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
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color={seller.isActive ? "red" : "green"}
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleToggle}
          >
            <Button.Title>
              {seller.isActive ? "Desativar" : "Ativar"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
