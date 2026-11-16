import { ButtonHTMLAttributes } from "react";
import { ThemeAppearance, ThemeColor } from "@/lib/theme";

export type ButtonSize = "lg" | "md" | "sm" | "xs";

/** `pill` arredonda por inteiro: avatar no topo, ícone de ajuda redondo. */
export type ButtonShape = "default" | "pill";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ThemeAppearance;
  color?: ThemeColor;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  isIconOnly?: boolean;
  active?: boolean;
  noPadding?: boolean;
  /**
   * Borda tracejada que acende em âmbar no hover: o "adicionar" que ocupa o
   * lugar do item que ainda não existe (fim de lista, célula vazia).
   */
  dashed?: boolean;
  /**
   * Abaixo do desktop o botão ocupa a linha inteira E ganha o fundo do tinted
   * da cor: esticado sem fundo (ghost/outline), ele se lia como uma sobra em
   * branco na linha, e não como botão. O desktop não muda.
   */
  fullWidthBelowDesktop?: boolean;
  shape?: ButtonShape;
  /**
   * Nome acessível + tooltip nativo do botão. Obrigatório na prática para
   * botões `isIconOnly` (ações de linha), onde não há texto visível: alimenta
   * `aria-label` (leitor de tela) e `title` (tooltip on-hover). Um `aria-label`
   * ou `title` passado explicitamente tem precedência sobre este.
   */
  label?: string;
}
