"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import React from "react";

export interface RowAction extends MoreOption {
  icon: React.ElementType;
  /**
   * A ação não vale para ESTA linha, mas vale para outras da mesma tabela
   * (remover pedido só em algumas situações): ela não entra no "⋯".
   */
  absent?: boolean;
}

interface RowActionsProps {
  /** Ações da linha, na ordem de leitura; `danger` pinta de vermelho. */
  actions: RowAction[];
  /**
   * Nome do "⋯" para leitor de tela — diga de QUAL linha é ("Ações do contato
   * Maria"), senão os menus de todas as linhas soam iguais.
   */
  label: string;
  /** Os modais controlados que as ações abrem (o gatilho mora aqui, não neles). */
  children?: React.ReactNode;
}

/**
 * Ações de uma linha de tabela: sempre um "⋯", com o nome de cada ação escrita.
 *
 * Até 23/11/2026 o desktop mostrava botões-ícone soltos (lápis, lixeira,
 * cadeado), e só o celular usava o "⋯". Ícone sem nome é adivinhação para o
 * público mais velho ("o cadeado bloqueia o quê?"), a coluna mudava de largura
 * conforme a linha e, com 3 ícones, a tabela do pedido cortava a última
 * coluna. O menu tem a mesma largura em toda linha e diz o que cada ação faz
 * (crítica de 23/11/2026). Os modais são controlados pelo dono da linha,
 * porque um item de menu não pode ser o `Trigger` deles.
 */
export function RowActions({ actions, label, children }: RowActionsProps) {
  const available = actions.filter((action) => !action.absent);
  if (available.length === 0) return <>{children}</>;

  return (
    <>
      <div className="flex justify-end">
        <MoreOptions options={available} label={label} />
      </div>
      {children}
    </>
  );
}
