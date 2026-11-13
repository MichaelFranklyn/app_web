"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Emphasis } from "@/components/Emphasis";
import { Ban } from "lucide-react";
import { useState } from "react";
import { EmailSuppressionInfo } from "../../interface";
import { formatMoment, suppressionReasonLabel } from "../../utils";
import { ReleaseSuppressionModal } from "../ReleaseSuppressionModal";

/**
 * O endereço pesquisado está na lista de bloqueio: o sistema nem tenta mandar.
 * É a resposta mais comum para "não recebi" — e a única que o suporte resolve
 * sozinho, liberando.
 */
export function SuppressionAlert({
  suppression,
  onReleased,
}: {
  suppression: EmailSuppressionInfo;
  onReleased: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Alert.Root variant="warning">
        <Alert.Icon icon={Ban} />
        <Alert.Content>
          <Alert.Title>Este endereço está bloqueado</Alert.Title>
          <Alert.Description>
            Desde {formatMoment(suppression.since)} o sistema{" "}
            <Emphasis>não envia</Emphasis> nada para {suppression.email}:{" "}
            {suppressionReasonLabel(suppression.reason)}
          </Alert.Description>
        </Alert.Content>
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Button.Title>Liberar endereço</Button.Title>
        </Button.Root>
      </Alert.Root>

      <ReleaseSuppressionModal
        email={open ? suppression.email : null}
        onOpenChange={setOpen}
        onDone={onReleased}
      />
    </>
  );
}
