"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { ReactNode } from "react";

interface Props {
  /** O nome da tabela ("Segmentos cadastrados"), como nas outras do app. */
  title: string;
  helpLabel: string;
  helpContent: ReactNode;
  /** O botão de adicionar da seção. */
  children: ReactNode;
}

/**
 * O topo da tabela de um catálogo: o NOME da lista, a explicação e a ação.
 *
 * Mesmo padrão das outras tabelas do app ("Contatos da fábrica", "Pessoas da
 * empresa"). Antes o título era a contagem ("3 segmentos", "nada cadastrado
 * ainda", "carregando…") e a tabela ficava sem nome — a contagem já aparece no
 * cartão do hub do catálogo, e o vazio é dito pelo EmptyState (14/11/2026).
 */
export function CatalogSectionHead({
  title,
  helpLabel,
  helpContent,
  children,
}: Props) {
  return (
    <Table.CardHead>
      <Table.CardHead.Title>
        {title}
        <HelpTooltip label={helpLabel} content={helpContent} />
      </Table.CardHead.Title>
      <Table.CardHead.Actions>{children}</Table.CardHead.Actions>
    </Table.CardHead>
  );
}
