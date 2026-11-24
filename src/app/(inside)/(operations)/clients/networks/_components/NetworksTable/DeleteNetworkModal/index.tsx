"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { CLIENT_NETWORK_CACHE_FIELDS } from "@/utils/cacheFields";
import { plural, pluralWord } from "@/utils/format/plural";
import { useMutation } from "@apollo/client/react";

import { DELETE_CLIENT_NETWORK_MUTATION } from "../../../gql";
import { ClientNetwork, DeleteClientNetworkResponse } from "../../../interface";

interface Props {
  /** Controlado: o gatilho é o "⋯" da linha (RowActions). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  network: ClientNetwork;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onChanged: () => void;
}

export function DeleteNetworkModal({
  open,
  onOpenChange,
  network,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onChanged,
}: Props) {
  const [deleteNetwork] = useMutation<DeleteClientNetworkResponse>(
    DELETE_CLIENT_NETWORK_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();

  // Dizer quantas lojas perdem a classificação é o que torna a decisão
  // informada — remover uma rede de 14 lojas não é o mesmo que remover uma vazia.
  const impact =
    network.storeCount > 0
      ? ` ${pluralWord(network.storeCount, "A loja continua", `As ${plural(network.storeCount, "loja", "lojas")} continuam`)} na carteira, apenas sem rede.`
      : "";

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover rede"
      description={`Remover a rede "${network.name}"?${impact}`}
      confirmLabel="Remover"
      successMessage="Rede removida"
      onBeforeConfirm={() => onRemoveOptimistic(network.id)}
      onConfirm={async () => {
        const res = await deleteNetwork({ variables: { id: network.id } });
        if (!res.data?.deleteClientNetwork?.status) {
          throw new Error(
            res.data?.deleteClientNetwork?.message ?? "Erro ao remover rede"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onChanged();
        // A ficha da rede deixa de existir junto com a linha.
        void invalidateClient(CLIENT_NETWORK_CACHE_FIELDS);
      }}
      onError={onRollback}
    />
  );
}
