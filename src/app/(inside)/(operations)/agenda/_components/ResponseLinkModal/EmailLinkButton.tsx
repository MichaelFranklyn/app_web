"use client";

import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Check, Mail } from "lucide-react";
import { useState } from "react";
import { SEND_VISIT_RESPONSE_LINK_EMAIL_MUTATION } from "./gql";

interface SendResponse {
  sendVisitResponseLinkEmail: { status: boolean; message: string } | null;
}

/**
 * A terceira saída do link, ao lado de copiar e WhatsApp: o sistema manda por
 * email ao vendedor da rotina (ou a quem a montou, se não tem vendedor). Usa o
 * link que acabou de ser gerado — emitir outro derrubaria este.
 */
export function EmailLinkButton({ url }: { url: string }) {
  const [send] = useMutation<SendResponse>(
    SEND_VISIT_RESPONSE_LINK_EMAIL_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const [isSent, setIsSent] = useState(false);

  const handleSend = () =>
    execute(
      async () => {
        const res = await send({ variables: { input: { url } } });
        const result = res.data?.sendVisitResponseLinkEmail;
        if (!result?.status) {
          throw new Error(
            result?.message ?? "Não foi possível enviar o email."
          );
        }
        return result;
      },
      {
        successMessage: (r) => r?.message,
        onSuccess: () => setIsSent(true),
      }
    );

  return (
    <Button.Root
      type="button"
      appearance="outline"
      color="neutral"
      size="sm"
      noUppercase
      loading={isLoading}
      disabled={isSent}
      onClick={() => void handleSend()}
      title="Manda este mesmo link para o email do vendedor da rotina."
    >
      <Button.Icon icon={isSent ? Check : Mail} />
      <Button.Title>
        {isSent ? "Enviado por email" : "Enviar por email ao vendedor"}
      </Button.Title>
    </Button.Root>
  );
}
