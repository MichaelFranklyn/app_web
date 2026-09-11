"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FACTORY_CONTACT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";

import { DELETE_FACTORY_CONTACT_MUTATION } from "../../gql";
import { DeleteFactoryContactResponse } from "../../interface";

interface Props {
  contactId: string;
  contactName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteContactModal({
  contactId,
  contactName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [deleteContact] = useMutation<DeleteFactoryContactResponse>(
    DELETE_FACTORY_CONTACT_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          appearance="ghost"
          color="red"
          size="sm"
          isIconOnly
          label="Remover contato"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover contato"
      description={`Remover ${contactName} dos contatos desta fábrica? Se for o contato usado no envio de pedidos, escolha outro depois.`}
      confirmLabel="Remover"
      successMessage="Contato removido"
      onBeforeConfirm={() => onRemoveOptimistic(contactId)}
      onConfirm={async () => {
        const res = await deleteContact({ variables: { id: contactId } });
        const payload = res.data?.deleteFactoryContact;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao remover contato");
        }
      }}
      onSuccess={() => {
        onCommit();
        void invalidateClient(FACTORY_CONTACT_CACHE_FIELDS);
      }}
      onError={onRollback}
    />
  );
}
