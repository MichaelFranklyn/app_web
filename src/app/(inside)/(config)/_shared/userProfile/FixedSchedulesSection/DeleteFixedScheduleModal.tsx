"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";

import { DELETE_FIXED_SCHEDULE_MUTATION } from "./gql";
import { DeleteFixedScheduleResponse } from "./interface";

interface Props {
  scheduleId: string;
  clientLabel: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFixedScheduleModal({
  scheduleId,
  clientLabel,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onDone,
  open,
  onOpenChange,
}: Props) {
  const [deleteSchedule] = useMutation<DeleteFixedScheduleResponse>(
    DELETE_FIXED_SCHEDULE_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover dia fixo"
      description={`O vendedor deixa de ter dia marcado em ${clientLabel}. As visitas que já aconteceram por causa do compromisso continuam no histórico, e o cliente volta a entrar na rotina pelo score, como os demais.`}
      confirmLabel="Remover"
      successMessage="Dia fixo removido"
      onBeforeConfirm={() => onRemoveOptimistic(scheduleId)}
      onConfirm={async () => {
        const res = await deleteSchedule({ variables: { id: scheduleId } });
        if (!res.data?.deleteFixedSchedule?.status) {
          throw new Error(
            res.data?.deleteFixedSchedule?.message ?? "Erro ao remover"
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
