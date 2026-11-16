"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { VISIT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_VISIT_SCHEDULE_ITEM_MUTATION } from "./gql";

interface DeleteVisitResponse {
  deleteVisitScheduleItem: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  visitId: string;
  visitLabel: string;
  onDeleted?: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteVisitModal({
  visitId,
  visitLabel,
  onDeleted,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setUncontrolledOpen(value);
  };
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteVisit] = useMutation<DeleteVisitResponse>(
    DELETE_VISIT_SCHEDULE_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(visitId);

    await execute(
      async () => {
        const res = await deleteVisit({ variables: { id: visitId } });
        if (!res.data?.deleteVisitScheduleItem?.status) {
          throw new Error(
            res.data?.deleteVisitScheduleItem?.message ??
              "Erro ao remover visita"
          );
        }
        return res.data.deleteVisitScheduleItem;
      },
      {
        successMessage: "Visita removida",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(VISIT_CACHE_FIELDS);
          onDeleted?.();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <Modal.Trigger asChild>
          <Button.Root
            appearance="ghost"
            color="red"
            size="sm"
            aria-label="Remover visita"
          >
            <Button.Icon icon={Trash2} />
          </Button.Root>
        </Modal.Trigger>
      )}

      <Modal.Content size="md">
        <Modal.Header
          title="Remover visita"
          description={`Remover a visita ${visitLabel}? Esta ação não pode ser desfeita.`}
        />
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Remover</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
