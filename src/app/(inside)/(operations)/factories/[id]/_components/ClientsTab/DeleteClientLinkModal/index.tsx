"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { CLIENT_FACTORY_LINK_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";

interface DeleteResponse {
  deleteSellerClientFactory: {
    status: boolean;
    message: string;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  linkId: string;
  clientName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteClientLinkModal({
  linkId,
  clientName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  open,
  onOpenChange,
}: Props) {
  const invalidateClient = useInvalidateQueriesClient();
  const [unlink] = useMutation<DeleteResponse>(
    DELETE_SELLER_CLIENT_FACTORY_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        open === undefined && (
          <Button.Root
            appearance="ghost"
            color="red"
            size="sm"
            isIconOnly
            label="Desvincular cliente"
          >
            <Button.Icon icon={Trash2} />
          </Button.Root>
        )
      }
      size="sm"
      title="Desvincular cliente"
      description={`Remover o vínculo de ${clientName} com esta fábrica? O cliente deixa de comprar por ela. Os pedidos já feitos continuam guardados.`}
      confirmLabel="Desvincular"
      successMessage="Cliente desvinculado com sucesso"
      onBeforeConfirm={() => onRemoveOptimistic(linkId)}
      onConfirm={async () => {
        const res = await unlink({ variables: { id: linkId } });
        if (!res.data?.deleteSellerClientFactory?.status) {
          throw new Error(
            res.data?.deleteSellerClientFactory?.message ??
              "Erro ao desvincular cliente"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        void invalidateClient(CLIENT_FACTORY_LINK_CACHE_FIELDS);
      }}
      onError={onRollback}
    />
  );
}
