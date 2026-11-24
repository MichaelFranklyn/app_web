"use client";

import { Alert } from "@/components/Alert";
import { HelpTooltip } from "@/components/HelpTooltip";
import { ListChecks } from "lucide-react";

import { PENDING_HELP } from "../../help";
import { scopeNote } from "../../utils";

interface Props {
  /** Os filtros da URL: dizem qual período os cartões estão contando. */
  filterValues: Record<string, string>;
}

/**
 * O aviso único da aba Pendências. O título e as abas são da central
 * (`layout.tsx`); aqui fica o que é desta aba: o que ela mostra, o período que
 * os cartões contam e a ajuda do que entra.
 *
 * Eram dois `Alert` empilhados — este e a nota "Período dos cartões" — e o
 * usuário pediu um só (18/11/2026): a segunda linha da descrição é o escopo.
 * Lê o período da URL, então aparece já no primeiro quadro, antes dos dados.
 * É texto, não evento: `role="note"` não interrompe o leitor de tela.
 *
 * Título + escopo, nada mais (crítica de design, 23/11/2026): "abra a lista…
 * resolveu, sai sozinho" foi para a ajuda (`PENDING_HELP`), que já diz que não
 * existe botão de baixa.
 */
export function PendingHeader({ filterValues }: Props) {
  return (
    <Alert.Root variant="info" role="note">
      <Alert.Icon icon={ListChecks} />
      <Alert.Content>
        <Alert.Title>
          Um cartão por assunto, os mais urgentes à vista
        </Alert.Title>
        <Alert.Description>{scopeNote(filterValues)}</Alert.Description>
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
