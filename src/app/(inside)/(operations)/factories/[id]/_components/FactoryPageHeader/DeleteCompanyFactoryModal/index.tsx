"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FACTORY_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { DELETE_COMPANY_FACTORY_MUTATION } from "./gql";

interface DeleteCompanyFactoryResponse {
  deleteCompanyFactory: { status: boolean; message: string };
}

interface Props {
  companyFactoryId: string;
  factoryName: string;
  /** Aberto pelo menu "Mais ações da fábrica" (sem gatilho próprio). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCompanyFactoryModal({
  companyFactoryId,
  factoryName,
  open,
  onOpenChange,
}: Props) {
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteCompanyFactory] = useMutation<DeleteCompanyFactoryResponse>(
    DELETE_COMPANY_FACTORY_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir vínculo com a fábrica"
      description={`Tem certeza que deseja excluir o vínculo com a fábrica "${factoryName}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir vínculo"
      successMessage="Vínculo com a fábrica removido"
      redirectTo="/factories"
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
      // A exclusão cascateia acessos, carteira e catálogo inteiro no backend:
      // a lista do assunto reflete isso (ver FACTORY_CACHE_FIELDS).
      onSuccess={() => invalidateClient(FACTORY_CACHE_FIELDS)}
    />
  );
}
