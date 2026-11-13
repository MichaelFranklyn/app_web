"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { MailX } from "lucide-react";
import { useActionState } from "react";
import { UnsubscribeState, unsubscribeAction } from "./actions";

interface Props {
  token: string;
}

const INITIAL_STATE: UnsubscribeState = { status: "idle", message: "" };

/** Uma pergunta e um botão. Depois de confirmar, o botão some. */
export function UnsubscribeContent({ token }: Props) {
  const [state, formAction, isPending] = useActionState(
    unsubscribeAction,
    INITIAL_STATE
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-[8px]">
        <Alert.Root variant="success">
          <Alert.Description>{state.message}</Alert.Description>
        </Alert.Root>
        <Title variant="body-sm" color="muted">
          Mudou de ideia? Entre no Itinus e ligue de novo em Meu perfil → Emails
          do Itinus.
        </Title>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[16px]">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-[8px]">
        <Title variant="body-md">
          Você vai deixar de receber o resumo da semana, as pendências e os
          parabéns de aniversário e datas comemorativas.
        </Title>
        <Title variant="body-sm" color="muted">
          Os emails de acesso à conta (convite, troca de senha e conta
          bloqueada) continuam chegando.
        </Title>
      </div>

      {state.status === "error" ? (
        <Alert.Root variant="error">
          <Alert.Description>{state.message}</Alert.Description>
        </Alert.Root>
      ) : null}

      <Button.Root
        type="submit"
        appearance="solid"
        color="red"
        size="md"
        noUppercase
        loading={isPending}
      >
        <Button.Icon icon={MailX} />
        <Button.Title>Não quero mais receber</Button.Title>
      </Button.Root>
    </form>
  );
}
