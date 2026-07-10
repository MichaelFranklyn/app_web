import { getThemeClasses, ThemeAppearance, ThemeColor } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ButtonSize } from "../Root/interface";

export const iconPixelSizes: Record<ButtonSize, number> = {
  lg: 18,
  md: 16,
  sm: 14,
  xs: 12,
};

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-[7px] font-head font-(--weight-bold) transition-all duration-[120ms] whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 disabled:opacity-35 disabled:cursor-default disabled:pointer-events-none";

const uppercaseClasses = "uppercase tracking-[0.04em]";

const sizeTextClasses: Record<ButtonSize, string> = {
  lg: "text-[13px] rounded-(--r-lg)",
  md: "text-[13px] rounded-(--r-md)",
  sm: "text-[13px] rounded-(--r-sm)",
  xs: "text-[13px] rounded-(--r-sm)",
};

const sizePaddingClasses: Record<ButtonSize, string> = {
  lg: "px-[20px] py-[11px]",
  md: "px-[16px] py-[8px]",
  sm: "px-[12px] py-[5px]",
  xs: "px-[8px]  py-[3px]",
};

// Piso de altura do botão de texto, espelhando inputSizeMinHeight. Sem ele a
// altura vem só do conteúdo: quando o texto some (estágio `icon` do
// Card.Header, que esconde [data-button-title] via CSS) sobra o ícone, menor
// que a linha de texto, e o botão encolhe em relação ao input ao lado.
const sizeMinHeightClasses: Record<ButtonSize, string> = {
  lg: "min-h-[44.8px]",
  md: "min-h-[38.8px]",
  sm: "min-h-[32.8px]",
  xs: "min-h-[28.8px]",
};

// Quadrados com a MESMA altura do botão de texto do mesmo size, para que
// só-ícone, botão com texto, badge e input fiquem alinhados lado a lado.
// Altura = line-height (1.6 × 13px = 20.8) + 2×padY (sizePaddingClasses) + 2×borda.
const iconOnlySizeClasses: Record<ButtonSize, string> = {
  lg: "w-[44.8px] h-[44.8px] p-0 rounded-(--r-lg)",
  md: "w-[38.8px] h-[38.8px] p-0 rounded-(--r-md)",
  sm: "w-[32.8px] h-[32.8px] p-0 rounded-(--r-sm)",
  xs: "w-[28.8px] h-[28.8px] p-0 rounded-(--r-sm)",
};

const appearanceHover: Record<ThemeAppearance, string> = {
  solid: "hover:brightness-90 hover:opacity-90",
  outline: "hover:bg-black/5 hover:opacity-80",
  tinted: "hover:brightness-95 hover:opacity-80",
  ghost: "hover:opacity-60",
};

const focusClasses =
  "focus-visible:ring-offset-1 focus-visible:ring-(--text)/20";

const activeIconOnlyClasses =
  "bg-(--amber-bg) text-(--amber) border-(--amber-bd)";

export interface GetButtonClassesProps {
  appearance: ThemeAppearance;
  color: ThemeColor;
  size: ButtonSize;
  isIconOnly: boolean;
  fullWidth: boolean;
  active: boolean;
  noPadding: boolean;
  noUppercase: boolean;
  className?: string;
}

export const getButtonClasses = ({
  appearance,
  color,
  size,
  isIconOnly,
  fullWidth,
  active,
  noPadding,
  noUppercase,
  className,
}: GetButtonClassesProps): string =>
  cn(
    baseClasses,
    !noUppercase && uppercaseClasses,
    getThemeClasses(appearance, color),
    appearanceHover[appearance],
    isIconOnly ? iconOnlySizeClasses[size] : sizeTextClasses[size],
    !noPadding && !isIconOnly && sizePaddingClasses[size],
    !noPadding && !isIconOnly && sizeMinHeightClasses[size],
    noPadding && "p-0",
    focusClasses,
    active && isIconOnly && activeIconOnlyClasses,
    fullWidth && "w-full",
    className
  );
