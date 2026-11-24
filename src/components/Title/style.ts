import { ElementTag, TitleColor, TitleVariant, TitleWeight } from "./interface";

export const variantConfig: Record<
  TitleVariant,
  {
    element: ElementTag;
    className: string;
    defaultWeight: TitleWeight;
  }
> = {
  hero: {
    element: "h1",
    className:
      "font-head text-hero-sm tablet:text-hero-md desktop:text-hero leading-none tracking-[-0.035em]",
    defaultWeight: "bold",
  },
  display: {
    element: "strong",
    className: "font-head text-display leading-none tracking-[-0.025em]",
    defaultWeight: "bold",
  },
  "heading-xl": {
    element: "h1",
    className: "font-head text-heading-xl leading-none tracking-[-0.025em]",
    defaultWeight: "bold",
  },
  "heading-lg": {
    element: "h2",
    className: "font-head text-heading-lg leading-none tracking-[-0.02em]",
    defaultWeight: "bold",
  },
  "heading-md": {
    element: "h3",
    className: "font-head text-heading-md leading-none tracking-[-0.015em]",
    defaultWeight: "bold",
  },
  "heading-sm": {
    element: "h4",
    className: "font-head text-heading-sm leading-none tracking-[-0.01em]",
    defaultWeight: "bold",
  },
  kpi: {
    element: "strong",
    className: "font-head text-kpi leading-none tracking-[-0.025em]",
    defaultWeight: "bold",
  },
  value: {
    element: "span",
    className: "font-head text-body leading-none tracking-[-0.01em]",
    defaultWeight: "bold",
  },
  body: {
    element: "span",
    className: "font-body text-body leading-[1.6]",
    defaultWeight: "regular",
  },
  lead: {
    element: "p",
    className: "font-body text-lead desktop:text-heading-md leading-[1.6]",
    defaultWeight: "regular",
  },
  "body-md": {
    element: "p",
    className: "font-body text-body-md leading-[1.6]",
    defaultWeight: "regular",
  },
  "body-sm": {
    element: "p",
    className: "font-body text-body-sm leading-[1.6]",
    defaultWeight: "regular",
  },
  "body-xs": {
    element: "span",
    className: "font-body text-body-sm leading-[1.6]",
    defaultWeight: "regular",
  },
  caption: {
    element: "span",
    className: "font-body text-body leading-none",
    defaultWeight: "regular",
  },
  micro: {
    element: "span",
    className: "font-body text-body-sm leading-none",
    defaultWeight: "regular",
  },
  label: {
    element: "span",
    className: "font-body text-body-sm leading-none",
    defaultWeight: "medium",
  },
  eyebrow: {
    element: "p",
    className: "font-body text-body-sm leading-none",
    defaultWeight: "medium",
  },
};

export const colorClasses: Record<TitleColor, string> = {
  default: "text-(--color-text)",
  // As faixas de aviso pintam o fundo de vermelho ou roxo e o texto de branco.
  // Sem uma cor para isso na escala, essas faixas escreviam o tamanho da fonte
  // à mão só para não herdar `--color-text` — e escapavam do Title inteiro por causa
  // de uma cor.
  inverse: "text-white",
  // Sobre o fundo âmbar da logo o branco dava 3,2:1; o escuro dá ~6:1 (18/11/2026).
  onAction: "text-(--color-on-action)",
  secondary: "text-(--color-text-secondary)",
  muted: "text-(--color-text-muted)",
  // Rótulo é texto de leitura: --color-text-disabled dava 2,6:1. Fica o nome por compatibilidade.
  muted2: "text-(--color-text-muted)",
  inherit: "text-inherit",
  amber: "text-(--color-action-text)",
  red: "text-(--color-status-danger)",
  green: "text-(--color-status-success)",
  blue: "text-(--color-status-info)",
  purple: "text-(--purple-text)",
  cyan: "text-(--cyan-text)",
  pink: "text-(--pink-text)",
  orange: "text-(--orange-text)",
  // Alerta (vence hoje, precisa de atenção): o âmbar é só do que se clica.
  warning: "text-(--color-status-warning)",
};

export const weightClasses: Record<TitleWeight, string> = {
  regular: "font-(--weight-regular)",
  medium: "font-(--weight-medium)",
  semibold: "font-(--weight-semibold)",
  bold: "font-(--weight-bold)",
  extrabold: "font-(--weight-extrabold)",
};
