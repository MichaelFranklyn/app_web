"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Tooltip } from "@/components/Tooltip";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import { formatDateDMY } from "@/utils/format/masks";
import { plural, pluralWord } from "@/utils/format/plural";
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
 * importada de novo, corrigida. Os clientes novos que vieram só por ela saem
 * da carteira junto; fica quem já tem outro pedido ou visita feita. O servidor recusa o lote todo se algum pedido
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
        successMessage: (payload) =>
          payload.data?.clientsUndone
            ? `Importação desfeita. ${plural(payload.data.clientsUndone, "cliente saiu", "clientes saíram")} da carteira.`
            : "Importação desfeita.",
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
      <Tooltip
        content="Remove os pedidos desta importação e os clientes que só vieram com ela. Pede o motivo antes de confirmar."
        className="max-w-[min(320px,calc(100vw-20px))] whitespace-normal"
      >
        <Modal.Trigger asChild>
          <Button.Root appearance="ghost" color="red" size="sm">
            <Button.Icon icon={Undo2} />
            <Button.Title>Desfazer</Button.Title>
          </Button.Root>
        </Modal.Trigger>
      </Tooltip>
      <Modal.Content size="sm">
        <Modal.Header
          title="Desfazer importação"
          description={`Importação de ${formatDateDMY(batch.createdAt)}, com ${plural(batch.ordersCount, "pedido", "pedidos")}. ${pluralWord(batch.ordersCount, "Ele sai", "Eles saem")} do sistema e a mesma planilha, corrigida, pode ser importada de novo.`}
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

            {batch.clientsCount > 0 && (
              <Alert.Root variant="warning">
                <Alert.Content>
                  <Alert.Title>
                    {`${pluralWord(batch.clientsCount, "O cliente novo sai", "Os clientes novos saem")} da carteira`}
                  </Alert.Title>
                  <Alert.Description>
                    {`${plural(batch.clientsCount, "cliente entrou", "clientes entraram")} na carteira com esta importação. ${pluralWord(batch.clientsCount, "Ele sai", "Eles saem")} junto, e as visitas marcadas ${pluralWord(batch.clientsCount, "dele", "deles")} são canceladas. Fica na carteira quem já tem outro pedido ou visita feita.`}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

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
