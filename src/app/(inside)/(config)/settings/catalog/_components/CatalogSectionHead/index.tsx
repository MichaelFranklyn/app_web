"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { ReactNode } from "react";

import { countLabel } from "../../utils";

interface Props {
  /** Quantos itens o catálogo tem AGORA (já com o otimista aplicado). */
  count: number;
  /** Primeira carga, sem nada para contar ainda. */
  loading: boolean;
  noun: { one: string; many: string };
  helpLabel: string;
  helpContent: ReactNode;
  /** O botão de adicionar da seção. */
  children: ReactNode;
}

/**
 * O topo da tabela de um catálogo: o TAMANHO da lista, a explicação e a ação.
 *
 * Não repete o nome do catálogo. Ele já está no cabeçalho da página, dois
 * centímetros acima, e a mesma frase duas vezes na mesma tela não informa nada
 * — o que falta ali é quanto já existe. O "?" continua onde estava, porque a
 * dúvida ("categoria ou segmento?") aparece justamente na hora de cadastrar.
 */
export function CatalogSectionHead({
  count,
  loading,
  noun,
  helpLabel,
  helpContent,
  children,
}: Props) {
  return (
    <Table.CardHead>
      <Table.CardHead.Title className="inline-flex items-center gap-6">
        {loading ? "carregando…" : countLabel(count, noun)}
        <HelpTooltip label={helpLabel} content={helpContent} />
      </Table.CardHead.Title>
      <Table.CardHead.Actions>{children}</Table.CardHead.Actions>
    </Table.CardHead>
  );
}
