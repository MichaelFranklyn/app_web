import { getThemeClasses, ThemeAppearance } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { BadgeAppearance, BadgeColor, BadgeSize } from "./interface";

const baseClasses =
  "inline-flex items-center gap-(--spacing-4) font-(--weight-medium) tracking-[0.06em] uppercase border whitespace-nowrap transition-colors w-max";

// Espelha exatamente o Button (Button/Root/style.ts → sizeText + sizePadding),
// para que badge e botão de mesmo size fiquem com a mesma altura quando usados
// lado a lado. Todos os tamanhos têm paridade 1:1 com o botão, inclusive o xs.
const sizeClasses: Record<BadgeSize, string> = {
  xs: "px-[8px] py-[3px] rounded-(--r-sm) text-[13px]",
  sm: "px-[12px] py-[5px] rounded-(--r-sm) text-[13px]",
  md: "px-[16px] py-[8px] rounded-(--r-md) text-[13px]",
  lg: "px-[20px] py-[11px] rounded-(--r-lg) text-[13px]",
};

export const getBadgeClasses = (
  color: BadgeColor,
  appearance: BadgeAppearance,
  size: BadgeSize,
  fullWidth?: boolean,
  className?: string
): string => {
  const typeClasses = getThemeClasses(
    appearance as ThemeAppearance,
    color as BadgeColor
  );
  return cn(
    baseClasses,
    sizeClasses[size],
    typeClasses,
    fullWidth && "w-full justify-center",
    className
  );
};
