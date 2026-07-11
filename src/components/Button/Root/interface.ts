import { ButtonHTMLAttributes } from "react";
import { ThemeAppearance, ThemeColor } from "@/lib/theme";

export type ButtonSize = "lg" | "md" | "sm" | "xs";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ThemeAppearance;
  color?: ThemeColor;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  isIconOnly?: boolean;
  active?: boolean;
  noPadding?: boolean;
  noUppercase?: boolean;
  /**
   * Nome acessível + tooltip nativo do botão. Obrigatório na prática para
   * botões `isIconOnly` (ações de linha), onde não há texto visível: alimenta
   * `aria-label` (leitor de tela) e `title` (tooltip on-hover). Um `aria-label`
   * ou `title` passado explicitamente tem precedência sobre este.
   */
  label?: string;
}
