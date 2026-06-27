"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DELETE_COMPANY_FACTORY_MUTATION } from "./gql";

interface DeleteCompanyFactoryResponse {
  deleteCompanyFactory: { status: boolean; message: string };
}

interface Props {
  companyFactoryId: string;
  factoryName: string;
}

export function DeleteCompanyFactoryModal({
  companyFactoryId,
  factoryName,
}: Props) {
  const router = useRouter();
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteCompanyFactory] = useMutation<DeleteCompanyFactoryResponse>(
    DELETE_COMPANY_FACTORY_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Trash2} />
          <Button.Title>Excluir</Button.Title>
        </Button.Root>
      }
      title="Excluir vínculo com a fábrica"
      description={`Tem certeza que deseja excluir o vínculo com a fábrica "${factoryName}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir vínculo"
      successMessage="Vínculo com a fábrica removido"
      onConfirm={async () => {
        const res = await deleteCompanyFactory({
          variables: { id: companyFactoryId },
        });
        if (!res.data?.deleteCompanyFactory?.status) {
          throw new Error(
            res.data?.deleteCompanyFactory?.message ??
              "Erro ao excluir vínculo da fábrica"
          );
        }
      }}
      onSuccess={async () => {
        await invalidateClient(["companyFactories"]);
        router.push("/factories");
      }}
    />
  );
}
