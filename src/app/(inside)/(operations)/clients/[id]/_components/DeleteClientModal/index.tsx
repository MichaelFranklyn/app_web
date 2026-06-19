"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useNavigation } from "@/hooks/useNavigation";
import { invalidateCacheMany } from "@/services/graphql/actions";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_COMPANY_CLIENT_MUTATION } from "./gql";

interface DeleteCompanyClientResponse {
  deleteCompanyClient: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  companyClientId: string;
  clientName: string;
}

export function DeleteClientModal({ companyClientId, clientName }: Props) {
  const [open, setOpen] = useState(false);
  const { navigateTo } = useNavigation();
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteCompanyClient] = useMutation<DeleteCompanyClientResponse>(
    DELETE_COMPANY_CLIENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteCompanyClient({
          variables: { id: companyClientId },
        });
        if (!res.data?.deleteCompanyClient?.status) {
          throw new Error(
            res.data?.deleteCompanyClient?.message ??
              "Erro ao remover cliente da carteira"
          );
        }
        return res.data.deleteCompanyClient;
      },
      {
        successMessage: "Cliente removido da carteira",
        onSuccess: async () => {
          setOpen(false);
          await invalidateClient(["clients_list"]);
          await invalidateCacheMany(["clients_stats"]);
          navigateTo("/clients");
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="red" size="sm" noUppercase>
          <Button.Icon icon={Trash2} />
          <Button.Title>Remover</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Remover cliente da carteira"
          description={`Remover "${clientName}" da carteira da sua empresa? Os vínculos, contatos e pedidos associados deixam de aparecer. Esta ação não pode ser desfeita.`}
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
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Remover</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
