"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";

import { DELETE_CLIENT_SEGMENT_MUTATION } from "../../../gql";
import { DeleteClientSegmentResponse } from "../interface";

interface Props {
  segmentId: string;
  segmentName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}

export function DeleteSegmentModal({
  segmentId,
  segmentName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onDone,
}: Props) {
  const [deleteSegment] = useMutation<DeleteClientSegmentResponse>(
    DELETE_CLIENT_SEGMENT_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          appearance="ghost"
          color="red"
          size="sm"
          isIconOnly
          label="Remover segmento"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover segmento"
      description={`Remover o segmento "${segmentName}"? Os clientes classificados nele continuam na carteira, apenas sem segmento.`}
      confirmLabel="Remover"
      successMessage="Segmento removido"
      onBeforeConfirm={() => onRemoveOptimistic(segmentId)}
      onConfirm={async () => {
        const res = await deleteSegment({ variables: { id: segmentId } });
        if (!res.data?.deleteClientSegment?.status) {
          throw new Error(
            res.data?.deleteClientSegment?.message ?? "Erro ao remover segmento"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onDone();
      }}
      onError={onRollback}
    />
  );
}
