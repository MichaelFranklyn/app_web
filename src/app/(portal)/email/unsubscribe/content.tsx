"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { MailX } from "lucide-react";
import { useActionState } from "react";
import { UnsubscribeState, unsubscribeAction } from "./actions";
import type { UnsubscribeCopy, UnsubscribeKind } from "./utils";

interface Props {
  token: string;
  kind: UnsubscribeKind;
  copy: UnsubscribeCopy;
}

const INITIAL_STATE: UnsubscribeState = { status: "idle", message: "" };

/** Uma pergunta e um botão. Depois de confirmar, o botão some. */
export function UnsubscribeContent({ token, kind, copy }: Props) {
  const [state, formAction, isPending] = useActionState(
    unsubscribeAction,
    INITIAL_STATE
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-8">
        <Alert.Root variant="success">
          <Alert.Description>{state.message}</Alert.Description>
        </Alert.Root>
        {copy.afterSuccess ? (
          <Title variant="body-sm" color="muted">
            {copy.afterSuccess}
          </Title>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-16">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="kind" value={kind} />

      <div className="flex flex-col gap-8">
        <Title variant="body-md">{copy.whatStops}</Title>
        <Title variant="body-sm" color="muted">
          {copy.whatKeeps}
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
        loading={isPending}
      >
        <Button.Icon icon={MailX} />
        <Button.Title>Não quero mais receber</Button.Title>
      </Button.Root>
    </form>
  );
}
