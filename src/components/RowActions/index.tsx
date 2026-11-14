"use client";

import { Button } from "@/components/Button";
import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import React from "react";

export interface RowAction extends MoreOption {
  icon: React.ElementType;
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
 * Ações de uma linha de tabela.
 *
 * No desktop, cada ação é um botão-ícone (cabe, e é um clique só). Abaixo do
 * desktop a tabela vira cartão e os ícones soltos — lápis, lixeira, sem nome —
 * viram adivinhação para quem usa o celular: lá elas entram no "⋯", onde cada
 * uma tem o nome escrito (14/11/2026). Os modais são controlados pelo dono da
 * linha, porque um item de menu não pode ser o `Trigger` deles.
 */
export function RowActions({ actions, label, children }: RowActionsProps) {
  if (actions.length === 0) return <>{children}</>;

  return (
    <>
      <div className="max-desktop:hidden flex items-center justify-end gap-4">
        {actions.map((action) => (
          <Button.Root
            key={action.label}
            appearance="ghost"
            color={action.danger ? "red" : "neutral"}
            size="sm"
            isIconOnly
            label={action.label}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            <Button.Icon icon={action.icon} />
          </Button.Root>
        ))}
      </div>
      <div className="desktop:hidden flex justify-end">
        <MoreOptions options={actions} label={label} />
      </div>
      {children}
    </>
  );
}
