import { HTMLAttributes, ReactNode } from "react";

export type TitleVariant =
  | "heading-xl"
  | "heading-lg"
  | "heading-md"
  | "heading-sm"
  | "kpi"
  | "value"
  | "body"
  | "body-md"
  | "body-sm"
  | "body-xs"
  | "caption"
  | "micro"
  | "label"
  | "eyebrow";

export type TitleColor =
  | "default"
  /** Texto sobre fundo colorido (faixa de offline, de impersonação). */
  | "inverse"
  | "secondary"
  | "muted"
  | "muted2"
  | "amber"
  | "red"
  | "green"
  | "blue"
  | "purple"
  | "cyan"
  | "pink"
  | "orange";

export type TitleWeight =
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

export interface TitleProps extends HTMLAttributes<HTMLElement> {
  variant: TitleVariant;
  color?: TitleColor;
  weight?: TitleWeight;
  /**
   * Troca a tag sem trocar a escala.
   *
   * Cada variante já vem com o elemento que costuma servir (`heading-md` é um
   * `h3`, `body-sm` é um `p`), mas o mesmo tamanho aparece em lugares onde
   * aquela tag mentiria: o número de um cartão de importação não é um cabeçalho
   * de seção, e o rótulo de um switch precisa ser um `label` para o clique
   * chegar ao campo. Sem esta saída, esses casos escreviam a tipografia à mão
   * só para escolher a tag — o guarda `typography.guard` conta a história.
   */
  as?: ElementTag;
  children?: ReactNode;
}

export type ElementTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "span"
  | "strong"
  | "label"
  | "div";
