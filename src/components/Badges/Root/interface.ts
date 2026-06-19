import { ThemeAppearance, ThemeColor } from "@/lib/theme";
import { HTMLAttributes, ReactNode } from "react";

export type BadgeColor = ThemeColor;
export type BadgeAppearance = ThemeAppearance;
// Mesma escala de tamanho do Button (Button/Root/interface.ts) — mantém os
// dois componentes alinhados quando usados lado a lado.
export type BadgeSize = "lg" | "md" | "sm" | "xs";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  color?: BadgeColor;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  fullWidth?: boolean;
}
