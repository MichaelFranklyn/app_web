"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { SET_CLIENT_FACTORY_NEGATIVE_MUTATION } from "../gql";
import {
  ClearNegativeModalProps,
  SetClientFactoryNegativeResponse,
} from "../interface";
import { negativeSinceLabel } from "../utils";

/**
 * Retira a negativação: o cliente volta às recomendações daquela fábrica e pode
 * receber pedido dela de novo.
 *
 * Confirmação, e não um clique direto, porque a consequência é justamente
 * liberar venda — e quem retira precisa saber há quanto tempo a fábrica estava
 * segurando o crédito antes de decidir.
 */
export function ClearNegativeModal({
  linkId,
  factoryName,
  clientName,
  negativeSince,
  open,
  onOpenChange,
  onSaved,
}: ClearNegativeModalProps) {
  const [setNegative] = useMutation<SetClientFactoryNegativeResponse>(
    SET_CLIENT_FACTORY_NEGATIVE_MUTATION
  );

  const who = clientName ?? "Este cliente";

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Retirar negativação"
      description={`${negativeSinceLabel(negativeSince)}. ${who} volta às recomendações de visita da fábrica "${factoryName}" e pode receber pedido dela de novo.`}
      confirmLabel="Retirar negativação"
      confirmColor="green"
      successMessage="Negativação retirada"
      onConfirm={async () => {
        const res = await setNegative({
          variables: { id: linkId, input: { isNegative: false } },
        });
        const payload = res.data?.setSellerClientFactoryNegative;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao retirar a negativação");
        }
        onSaved?.({
          isNegative: false,
          negativeSince: null,
          negativeReason: null,
        });
      }}
    />
  );
}
