"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";

import { DELETE_CLIENT_NETWORK_MUTATION } from "../../../gql";
import { ClientNetwork, DeleteClientNetworkResponse } from "../../../interface";

interface Props {
  network: ClientNetwork;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onChanged: () => void;
}

export function DeleteNetworkModal({
  network,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onChanged,
}: Props) {
  const [deleteNetwork] = useMutation<DeleteClientNetworkResponse>(
    DELETE_CLIENT_NETWORK_MUTATION
  );

  // Dizer quantas lojas perdem a classificação é o que torna a decisão
  // informada — remover uma rede de 14 lojas não é o mesmo que remover uma vazia.
  const impact =
    network.storeCount > 0
      ? ` As ${network.storeCount} loja(s) continuam na carteira, apenas sem rede.`
      : "";

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          appearance="ghost"
          color="red"
          size="sm"
          isIconOnly
          label="Remover rede"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
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
      }}
      onError={onRollback}
    />
  );
}
