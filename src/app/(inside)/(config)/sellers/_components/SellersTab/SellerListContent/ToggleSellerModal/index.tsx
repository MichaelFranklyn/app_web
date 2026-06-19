"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

interface ToggleSellerResponse {
  updateSeller: {
    status: boolean;
    message: string;
  };
}

const TOGGLE_SELLER_MUTATION = gql`
  mutation ToggleSeller($id: UUID!, $input: UpdateSellerInput!) {
    updateSeller(id: $id, input: $input) {
      status
      message
    }
  }
`;

interface ToggleSellerModalProps {
  id: string;
  sellerName: string;
  isActive: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onToggle: () => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function ToggleSellerModal({
  id,
  sellerName,
  isActive,
  open,
  onOpenChange,
  onToggle,
  onCommit,
  onRollback,
}: ToggleSellerModalProps) {
  const [updateSeller] = useMutation<ToggleSellerResponse>(TOGGLE_SELLER_MUTATION);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onToggle();

    await execute(
      async () => {
        const res = await updateSeller({
          variables: { id, input: { isActive: !isActive } },
        });

        if (!res.data?.updateSeller?.status) {
          throw new Error(res.data?.updateSeller?.message ?? "Erro ao atualizar vendedor");
        }

        return res.data.updateSeller;
      },
      {
        successMessage: isActive ? "Vendedor desativado com sucesso" : "Vendedor ativado com sucesso",
        onSuccess: async () => {
          onCommit();
          onOpenChange(false);
          await invalidateClient(["sellers_list", "seller_factory_access_list"]);
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={isActive ? "Desativar vendedor" : "Ativar vendedor"}
          description={`Tem certeza que deseja ${isActive ? "desativar" : "ativar"} o vendedor "${sellerName}"?${isActive ? " Os acessos às fábricas também serão desativados." : ""}`}
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
            color={isActive ? "red" : "green"}
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>{isActive ? "Desativar" : "Ativar"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
