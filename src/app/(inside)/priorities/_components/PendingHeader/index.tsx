"use client";

import { Alert } from "@/components/Alert";
import { HelpTooltip } from "@/components/HelpTooltip";
import { ListChecks } from "lucide-react";

import { PENDING_HELP } from "../../help";

/**
 * A frase da aba Pendências. O título e as abas são da central (`layout.tsx`);
 * aqui fica só o que é desta aba: o que ela mostra e a ajuda do que entra.
 * Vem num `Alert` informativo (14/11/2026): o texto corrido em cinza passava
 * despercebido e o usuário pediu o componente de aviso. É texto fixo, então
 * `role="note"` — não interrompe o leitor de tela como um alerta faria.
 */
export function PendingHeader() {
  return (
    <Alert.Root variant="info" role="note">
      <Alert.Icon icon={ListChecks} />
      <Alert.Content>
        <Alert.Title>
          Um cartão por assunto, os mais urgentes à vista
        </Alert.Title>
        <Alert.Description>
          Abra a lista do assunto para ir direto aonde cada um se resolve.
          Resolveu, sai daqui sozinho.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <HelpTooltip
          label="O que entra nas pendências?"
          content={PENDING_HELP}
        />
      </Alert.Actions>
    </Alert.Root>
  );
}
