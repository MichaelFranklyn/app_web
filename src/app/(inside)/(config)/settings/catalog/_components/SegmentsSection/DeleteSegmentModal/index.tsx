"use client";

import type { CatalogModalControl } from "../../../interface";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";

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
  open,
  onOpenChange,
}: Props & CatalogModalControl) {
  const [deleteSegment] = useMutation<DeleteClientSegmentResponse>(
    DELETE_CLIENT_SEGMENT_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
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
