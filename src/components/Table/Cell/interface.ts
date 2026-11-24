import React from "react";
import { TableHeadAlign } from "../Head/interface";
import { tableCellVariants } from "./style";

/**
 * Lugar da célula no cartão de `<Table.Table cards>` (abaixo de 1024px):
 * - `title`: identidade da linha (cliente, produto), no alto;
 * - `value`: o número que responde a lista, no alto à direita;
 * - `status`: a etiqueta de situação, sob o valor;
 * - `actions`: os botões da linha, no pé do cartão;
 * - `aside`: um detalhe com controle (ex.: "Conferência: [Conferir]") que
 *   divide a última linha com `actions`, em vez de o "…" ficar sozinho nela.
 *   A célula `aside` vem logo ANTES da `actions` na linha;
 * - `lead`: a caixa de seleção, à esquerda;
 * - `hidden`: fica de fora do cartão (está no detalhe da entidade).
 * Sem `card`, a célula é detalhe: uma linha rotulada por `label`.
 */
export type TableCardRole =
  | "title"
  | "value"
  | "amount"
  | "status"
  | "actions"
  | "aside"
  | "lead"
  | "hidden";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: keyof typeof tableCellVariants;
  flex?: boolean;
  /**
   * Alinhamento do conteúdo. Use o MESMO do `Table.Head` da coluna: número
   * alinhado à direita só se lê como coluna de número quando o título
   * acompanha.
   */
  align?: TableHeadAlign;
  /**
   * Quebra de linha no desktop. Texto longo escrito direto na célula já quebra
   * sozinho (ver `isLongCellText`); `true` força a quebra quando o texto vem
   * dentro de outro componente, e `false` trava a célula em uma linha.
   */
  wrap?: boolean;
  /** Lugar no cartão de `<Table.Table cards>` — ver `TableCardRole`. */
  card?: TableCardRole;
  /**
   * Rótulo da célula de detalhe no cartão ("Fábrica: Herc"): lá o cabeçalho
   * some, e o dado sozinho não diz o que é. Use o texto do `Table.Head`.
   */
  label?: string;
  /**
   * O que a célula diz quando o dado não existe. O padrão é "Não informado",
   * mas há coluna em que o vazio tem nome ("Nunca comprou", "Em dia", "Sem NF")
   * ou em que a frase repetiria o que a linha já disse — aí "—".
   */
  emptyText?: string;
  /**
   * Some do cartão (celular/tablet). Para detalhe opcional que, vazio, só
   * repetiria "Não informado" em toda linha. No desktop a célula continua,
   * para a coluna não desalinhar.
   */
  cardHidden?: boolean;
}
