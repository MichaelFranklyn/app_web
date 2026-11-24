import { getThemeClasses, ThemeAppearance } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { BadgeAppearance, BadgeColor, BadgeSize } from "./interface";

// justify-center + text-center na BASE, não só no fullWidth: a tag esticada
// pelo pai (grid, coluna do card, estágio column do header) ficava com o texto
// grudado à esquerda e sobra à direita (teste em aparelho, 13/11/2026).
const baseClasses =
  "inline-flex items-center justify-center text-center gap-(--spacing-4) rounded-full font-(--weight-semibold) border whitespace-nowrap transition-colors w-max max-w-full";

// Altura espelha o Button (Button/Root/style.ts → sizeText + sizePadding),
// para que badge e botão de mesmo size fiquem alinhados lado a lado.
//
// A FORMA não espelha: selo é pílula (rounded-full), botão é retângulo de
// canto arredondado. Com a mesma forma, a mesma borda e a mesma altura, o
// status "ENTREGUE" ao lado de "Editar" parecia mais um botão (revisão UX,
// 13/11/2026). A forma separa "isto informa" de "isto se clica". A caixa alta
// saiu em 14/11/2026: lê pior para o público idoso; o peso semibold sustenta
// o selo sem gritar.
const sizeClasses: Record<BadgeSize, string> = {
  xs: "px-10 py-3 text-body-sm",
  sm: "px-12 py-5 text-body-sm",
  md: "px-16 py-8 text-body-sm",
  lg: "px-20 py-[11px] text-body-sm",
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
    fullWidth && "w-full",
    className
  );
};
