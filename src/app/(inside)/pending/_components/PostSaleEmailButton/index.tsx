"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Mail } from "lucide-react";

import { PendingItem } from "../../interface";
import { SEND_POST_SALE_EMAIL_MUTATION } from "./gql";

interface SendResponse {
  sendPostSaleEmail: { status: boolean; message: string } | null;
}

/**
 * O pós-venda pelo EMAIL do contato do cliente — a outra porta, ao lado do
 * WhatsApp. Confirma antes: o email sai do sistema para o cliente, e a pessoa
 * vê para quem vai. A resposta do cliente volta para quem apertou.
 *
 * Nada é gravado: a pendência só some quando a entrega for marcada no pedido.
 */
export function PostSaleEmailButton({ item }: { item: PendingItem }) {
  const [send] = useMutation<SendResponse>(SEND_POST_SALE_EMAIL_MUTATION);
  const email = item.contactEmail;
  if (!email || !item.orderId) return null;

  const handleConfirm = async () => {
    const res = await send({ variables: { id: item.orderId } });
    const result = res.data?.sendPostSaleEmail;
    if (!result?.status) {
      throw new Error(result?.message ?? "Não foi possível enviar o email.");
    }
  };

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="xs"
          noUppercase
          aria-label={`Perguntar por email se o pedido de ${item.clientName} foi entregue`}
        >
          <Button.Icon icon={Mail} />
          <Button.Title>Email</Button.Title>
        </Button.Root>
      }
      title="Enviar o pós-venda por email?"
      description={`Vai para ${email}, perguntando se o pedido chegou bem. Se o cliente responder, a resposta chega no seu email. A pendência continua aqui até a entrega ser marcada no pedido.`}
      confirmLabel="Enviar email"
      confirmColor="amber"
      onConfirm={handleConfirm}
      successMessage={`Pós-venda enviado para ${email}.`}
    />
  );
}
