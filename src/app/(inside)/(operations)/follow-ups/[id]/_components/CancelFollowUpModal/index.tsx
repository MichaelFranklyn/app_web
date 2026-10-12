"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { CANCEL_FOLLOW_UP_MUTATION } from "@/graphql/followUps";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FOLLOW_UP_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import {
  CancelFollowUpResponse,
  FollowUpActionModalProps,
} from "../../interface";
import { hasCancelReason } from "../../utils";

/**
 * Cancelar: o contato não vai mais acontecer. Não apaga nada — o agendamento
 * fica no histórico do cliente com o motivo, que é o que se relê quando a
 * negociação volta.
 *
 * O motivo é OBRIGATÓRIO (o servidor recusa sem ele): cancelar tira o contato
 * das pendências sem ninguém ter falado com o cliente, e "cancelado" sozinho
 * não diz se ele desistiu ou se alguém só limpou a fila.
 */
export function CancelFollowUpModal({
  open,
  onOpenChange,
  followUp,
  onDone,
}: FollowUpActionModalProps) {
  const [reason, setReason] = useState("");
  const [cancel] = useMutation<CancelFollowUpResponse>(
    CANCEL_FOLLOW_UP_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();
  const isValid = hasCancelReason(reason);

  const submit = () =>
    execute(
      async () => {
        const res = await cancel({
          variables: {
            input: { id: followUp.id, reason: reason.trim() },
          },
        });
        const payload = res.data?.cancelClientFollowUp;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao cancelar o contato");
        }
        return payload;
      },
      {
        successMessage: "Contato cancelado",
        onSuccess: () => {
          onOpenChange(false);
          onDone();
          void invalidateClient(FOLLOW_UP_CACHE_FIELDS);
        },
      }
    );

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Cancelar contato"
          description="O contato sai das pendências, mas continua no histórico do cliente."
        />
        <Modal.Body>
          <Input.Textarea
            label="Por que não vai mais acontecer"
            required
            rows={3}
            placeholder="Ex: Cliente fechou com outro fornecedor."
            hint="Fica no histórico do cliente. Sem o motivo o contato não é cancelado."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Modal.Body>
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
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={!isValid}
            onClick={() => submit()}
          >
            <Button.Title>Cancelar contato</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
