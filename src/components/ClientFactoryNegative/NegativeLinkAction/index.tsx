"use client";

import type { RowAction } from "@/components/RowActions";
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
 * A ação da negativação para as linhas de tabela: marca quando está livre,
 * retira quando está negativado.
 *
 * Devolve a ação (entra no `RowActions` da linha — ícone no desktop, item do
 * "⋯" no celular) e o modal que ela abre. O rótulo diz "nesta fábrica" porque
 * é a única informação que separa esta ação de um bloqueio geral do cliente.
 */
export function useNegativeLinkAction({
  linkId,
  factoryName,
  clientName,
  isNegative,
  negativeSince = null,
  onSaved,
}: Props): { action: RowAction; modal: React.ReactNode } {
  const [open, setOpen] = useState(false);

  return {
    action: {
      label: isNegative
        ? "Retirar negativação nesta fábrica"
        : "Marcar como negativado nesta fábrica",
      icon: isNegative ? ShieldCheck : Ban,
      danger: !isNegative,
      onClick: () => setOpen(true),
    },
    modal: (
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
    ),
  };
}
