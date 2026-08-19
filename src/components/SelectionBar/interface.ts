import { ReactNode } from "react";

export interface SelectionBarProps {
  /** Quantas linhas estão marcadas. Zero esconde a barra. */
  count: number;
  /**
   * O que dizer depois do número, já flexionado:
   * `{ singular: "parcela selecionada", plural: "parcelas selecionadas" }` vira
   * "3 parcelas selecionadas". A frase inteira vem de fora porque a concordância
   * muda com o gênero do substantivo ("1 pedido selecionado").
   */
  noun: { singular: string; plural: string };
  /** Onde a seleção vale — "Fábrica Alfa · agosto de 2026". */
  scopeLabel?: string;
  /** Os atalhos do lote: botões e modais, na ordem em que devem aparecer. */
  children?: ReactNode;
  onClear: () => void;
  clearLabel?: string;
}
