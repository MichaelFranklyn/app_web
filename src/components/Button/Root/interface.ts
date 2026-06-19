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
}
