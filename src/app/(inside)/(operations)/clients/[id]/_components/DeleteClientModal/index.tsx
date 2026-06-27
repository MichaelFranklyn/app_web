"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useNavigation } from "@/hooks/useNavigation";
import { invalidateCacheMany } from "@/services/graphql/actions";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
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
  const { navigateTo } = useNavigation();
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteCompanyClient] = useMutation<DeleteCompanyClientResponse>(
    DELETE_COMPANY_CLIENT_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="outline" color="red" size="sm" noUppercase>
          <Button.Icon icon={Trash2} />
          <Button.Title>Remover</Button.Title>
        </Button.Root>
      }
      title="Remover cliente da carteira"
      description={`Remover "${clientName}" da carteira da sua empresa? Os vínculos, contatos e pedidos associados deixam de aparecer. Esta ação não pode ser desfeita.`}
      confirmLabel="Remover"
      successMessage="Cliente removido da carteira"
      onConfirm={async () => {
        const res = await deleteCompanyClient({
          variables: { id: companyClientId },
        });
        if (!res.data?.deleteCompanyClient?.status) {
          throw new Error(
            res.data?.deleteCompanyClient?.message ??
              "Erro ao remover cliente da carteira"
          );
        }
      }}
      onSuccess={async () => {
        await invalidateClient(["clients_list"]);
        await invalidateCacheMany(["clients_stats"]);
        navigateTo("/clients");
      }}
    />
  );
}
