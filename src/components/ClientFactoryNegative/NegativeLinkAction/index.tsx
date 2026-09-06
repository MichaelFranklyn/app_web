"use client";

import { Button } from "@/components/Button";
import { Ban, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { NegativeLinkModal } from "../NegativeLinkModal";
import { ClientFactoryNegativeState } from "../interface";

interface Props {
  linkId: string;
  factoryName: string;
  clientName?: string;
  isNegative: boolean;
  negativeSince?: string | null;
  onSaved?: (state: ClientFactoryNegativeState) => void;
}

/**
 * O botão da negativação para as linhas de tabela: marca quando está livre,
 * retira quando está negativado.
 *
 * O rótulo diz a fábrica ("...nesta fábrica") porque é a única informação que
 * separa esta ação de um bloqueio geral do cliente — e é ela que o leitor de
 * tela anuncia.
 */
export function NegativeLinkAction({
  linkId,
  factoryName,
  clientName,
  isNegative,
  negativeSince = null,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button.Root
        appearance="ghost"
        color={isNegative ? "green" : "red"}
        size="sm"
        aria-label={
          isNegative
            ? `Retirar a negativação em ${factoryName}`
            : `Marcar como negativado em ${factoryName}`
        }
        title={
          isNegative
            ? "Retirar negativação"
            : "Marcar cliente como negativado nesta fábrica"
        }
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={isNegative ? ShieldCheck : Ban} />
      </Button.Root>

      <NegativeLinkModal
        linkId={linkId}
        factoryName={factoryName}
        clientName={clientName}
        isNegative={isNegative}
        negativeSince={negativeSince}
        open={open}
        onOpenChange={setOpen}
        onSaved={onSaved}
      />
    </>
  );
}
