"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import { formatDateDMY } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { Undo2 } from "lucide-react";
import { useState } from "react";

import { UNDO_HISTORY_IMPORT_MUTATION } from "../../../gql";
import {
  HistoryImportBatch,
  UndoHistoryImportResponse,
} from "../../../interface";

interface Props {
  batch: HistoryImportBatch;
  onUndone: () => void;
}

/** Mesmos limites do backend (`undo_order_history_import.py`). */
const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

/**
 * Desfaz a importação inteira: os pedidos daquela planilha saem e ela pode ser
 * importada de novo, corrigida. O servidor recusa o lote todo se algum pedido
 * já foi mexido depois — a mensagem diz quantos e por quê.
 */
export function UndoBatchModal({ batch, onUndone }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [undo] = useMutation<UndoHistoryImportResponse>(
    UNDO_HISTORY_IMPORT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH;

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setReason("");
  };

  const handleConfirm = () =>
    execute(
      async () => {
        const res = await undo({
          variables: { id: batch.id, input: { reason: reason.trim() } },
        });
        const payload = res.data?.undoOrderHistoryImport;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Não foi possível desfazer a importação."
          );
        }
        return payload;
      },
      {
        successMessage: () => "Importação desfeita.",
        onSuccess: () => {
          handleOpenChange(false);
          onUndone();
          // Os pedidos somem de /orders, dos relatórios e da ficha do cliente.
          void invalidateClient(ORDER_CACHE_FIELDS);
        },
      }
    );

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="red" size="sm">
          <Button.Icon icon={Undo2} />
          <Button.Title>Desfazer</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header
          title="Desfazer importação"
          description={`Importação de ${formatDateDMY(batch.createdAt)}, com ${batch.ordersCount} pedido(s). Eles saem do sistema e a mesma planilha, corrigida, pode ser importada de novo.`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Alert.Root variant="warning">
              <Alert.Content>
                <Alert.Title>O ritmo de compra é refeito</Alert.Title>
                <Alert.Description>
                  As compras desses pedidos deixam de contar na rotina, no score
                  e nos relatórios dos clientes envolvidos.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>

            <Input.Textarea
              label="Motivo"
              required
              hint="Fica registrado junto da importação, com a data e o seu nome."
              placeholder="Ex: planilha de outra fábrica"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={MAX_REASON_LENGTH}
              rows={3}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              disabled={isLoading}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            loading={isLoading}
            disabled={!isReasonValid}
            onClick={handleConfirm}
          >
            <Button.Title>Desfazer importação</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
