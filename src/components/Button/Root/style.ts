import { getThemeClasses, ThemeAppearance, ThemeColor } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ButtonShape, ButtonSize } from "../Root/interface";

export const iconPixelSizes: Record<ButtonSize, number> = {
  lg: 18,
  md: 16,
  sm: 14,
  xs: 12,
};

/**
 * Caixa do texto: decidida AQUI, não em quem chama. Caixa mista — mais legível
 * para o público (auditoria UX, item 8); não existe mais opt-out por botão.
 */
//
// Transição só do que muda (cor, filtro, sombra e escala), na curva das
// camadas: `transition-all` animava até largura/padding quando o cabeçalho
// esticava o botão. O `active:scale` é o retorno físico do clique; o movimento
// reduzido o desliga.
const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-[7px] font-head font-(--weight-bold) transition-[background-color,border-color,color,filter,box-shadow,scale] duration-150 ease-(--ease-out-soft) active:scale-[0.97] motion-reduce:active:scale-100 whitespace-nowrap border focus-ring disabled:opacity-35 disabled:cursor-default disabled:pointer-events-none";

const sizeTextClasses: Record<ButtonSize, string> = {
  lg: "text-body-sm rounded-(--r-lg)",
  md: "text-body-sm rounded-(--r-md)",
  sm: "text-body-sm rounded-(--r-sm)",
  xs: "text-body-sm rounded-(--r-sm)",
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

// Hover por FUNDO, nunca por opacity: o `opacity` desbotava o texto junto e
// derrubava o contraste (4,6:1 do âmbar sólido caía abaixo de 4,5). O sólido
// escurece (o branco ganha contraste) e ganha uma sombra curta de relevo.
const appearanceHover: Record<ThemeAppearance, string> = {
  solid:
    "shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:brightness-[0.92] hover:shadow-(--shadow-sm)",
  outline: "hover:bg-(--bg3)",
  tinted: "hover:brightness-[0.96]",
  ghost: "hover:bg-(--bg4)/60",
};

const activeIconOnlyClasses =
  "bg-(--amber-bg) text-(--color-action-text-on-tint) border-(--amber-bd)";

// Fundo do tinted, só abaixo do desktop, para o botão esticado na linha
// (`fullWidthBelowDesktop`). Literais por cor: o Tailwind só gera a classe que
// lê inteira no código. Cor sem entrada cai no neutro.
const fillBelowDesktopClasses: Partial<Record<ThemeColor, string>> = {
  neutral:
    "max-desktop:bg-(--bg3) max-desktop:border-(--color-border-control) max-desktop:text-(--color-text-secondary)",
  green:
    "max-desktop:bg-(--color-status-success-bg) max-desktop:border-(--color-status-success-bd)",
  red: "max-desktop:bg-(--color-status-danger-bg) max-desktop:border-(--color-status-danger-bd)",
  amber: "max-desktop:bg-(--amber-bg) max-desktop:border-(--amber-bd)",
  blue: "max-desktop:bg-(--color-status-info-bg) max-desktop:border-(--color-status-info-bd)",
};

// Botão ghost/outline neutro que o cabeçalho ESTICA abaixo do desktop (estágio column
// do Card.Header; estágio de linha que divide a linha no PanelHeader.Actions):
// sem fundo, o botão esticado parece sobra em branco. Recebe o fundo neutro
// (o mesmo de `fullWidthBelowDesktop`) e a largura toda.
const stretchedByHeaderClasses = [
  "max-desktop:group-data-[actions-mode=column]/cardhead:w-full",
  "max-desktop:group-data-[actions-mode=column]/cardhead:bg-(--bg3)",
  "max-desktop:group-data-[actions-mode=column]/cardhead:border-(--color-border-control)",
  "max-desktop:group-data-[actions-fill]/panelhead:bg-(--bg3)",
  "max-desktop:group-data-[actions-fill]/panelhead:border-(--color-border-control)",
  "max-desktop:group-data-[actions-mode=column]/panelhead:bg-(--bg3)",
  "max-desktop:group-data-[actions-mode=column]/panelhead:border-(--color-border-control)",
].join(" ");

export interface GetButtonClassesProps {
  appearance: ThemeAppearance;
  color: ThemeColor;
  size: ButtonSize;
  isIconOnly: boolean;
  fullWidth: boolean;
  active: boolean;
  noPadding: boolean;
  dashed?: boolean;
  fullWidthBelowDesktop?: boolean;
  shape?: ButtonShape;
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
  dashed = false,
  fullWidthBelowDesktop = false,
  shape = "default",
  className,
}: GetButtonClassesProps): string =>
  cn(
    baseClasses,
    getThemeClasses(appearance, color),
    // Ghost sem padding é texto clicável no meio da linha: o fundo do hover
    // ficaria colado na letra. Ele sublinha.
    noPadding && appearance === "ghost"
      ? "hover:underline underline-offset-[3px]"
      : appearanceHover[appearance],
    isIconOnly ? iconOnlySizeClasses[size] : sizeTextClasses[size],
    !noPadding && !isIconOnly && sizePaddingClasses[size],
    !noPadding && !isIconOnly && sizeMinHeightClasses[size],
    noPadding && "p-0",
    shape === "pill" && "rounded-full",
    active && isIconOnly && activeIconOnlyClasses,
    fullWidth && "w-full",
    fullWidthBelowDesktop &&
      cn(
        "max-desktop:w-full",
        appearance !== "solid" &&
          appearance !== "tinted" &&
          (fillBelowDesktopClasses[color] ?? fillBelowDesktopClasses.neutral)
      ),
    // Só botão com texto: o só-ícone (o "?" do HelpTooltip ao lado do título)
    // também mora dentro do header e esticava até a largura do card, virando
    // uma caixa vazia com o "?" na ponta.
    (appearance === "ghost" || appearance === "outline") &&
      color === "neutral" &&
      !isIconOnly &&
      stretchedByHeaderClasses,
    dashed &&
      "border-dashed border-(--color-border-control) hover:border-(--amber) hover:text-(--color-action-text)",
    className
  );
