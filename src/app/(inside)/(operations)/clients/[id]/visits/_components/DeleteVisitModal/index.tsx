"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
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
}: Props) {
  const [open, setOpen] = useState(false);
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
          await invalidateClient(["visitsBySellerClientFactory"]);
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
      <Modal.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="red"
          size="xs"
          aria-label="Remover visita"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

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
              noUppercase
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
            noUppercase
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
