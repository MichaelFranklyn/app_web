export type ThemeAppearance = "tinted" | "outline" | "solid" | "ghost";

export type ThemeColor =
  | "red"
  | "amber"
  | "blue"
  | "green"
  | "neutral"
  | "subtle"
  | "cyan"
  | "purple"
  | "orange"
  | "pink"
  /** Alerta (vencido, precisa de atenção). Âmbar é só para o que se clica. */
  | "warning";

const themeVariants: Record<ThemeAppearance, Record<ThemeColor, string>> = {
  tinted: {
    red: "bg-(--color-status-danger-bg) border-(--color-status-danger-bd) text-(--color-status-danger)",
    amber:
      "bg-(--amber-bg) border-(--amber-bd) text-(--color-action-text-on-tint)",
    blue: "bg-(--color-status-info-bg) border-(--color-status-info-bd) text-(--color-status-info)",
    green:
      "bg-(--color-status-success-bg) border-(--color-status-success-bd) text-(--color-status-success)",
    neutral:
      "bg-(--bg3) border-(--color-border-control) text-(--color-text-muted)",
    subtle:
      "bg-(--bg3) border-(--color-border-control) text-(--color-text-secondary)",
    cyan: "bg-(--cyan-bg) border-(--cyan)/20 text-(--cyan-text)",
    purple: "bg-(--purple-bg) border-(--purple)/20 text-(--purple-text)",
    orange: "bg-(--orange-bg) border-(--orange)/20 text-(--orange-text)",
    pink: "bg-(--pink-bg) border-(--pink)/20 text-(--pink-text)",
    warning:
      "bg-(--color-status-warning-bg) border-(--color-status-warning-bd) text-(--color-status-warning)",
  },
  outline: {
    // Mesma borda dos inputs (--color-border-control): botão, tag e campo lado
    // a lado têm o mesmo contorno.
    neutral:
      "bg-transparent border-(--color-border-control) text-(--color-text-secondary)",
    subtle:
      "bg-transparent border-(--color-border-control) text-(--color-text-secondary)",
    red: "bg-transparent border-(--color-status-danger) text-(--color-status-danger)",
    amber: "bg-transparent border-(--amber) text-(--color-action-text)",
    blue: "bg-transparent border-(--color-status-info) text-(--color-status-info)",
    green:
      "bg-transparent border-(--color-status-success) text-(--color-status-success)",
    cyan: "bg-transparent border-(--cyan) text-(--cyan-text)",
    purple: "bg-transparent border-(--purple) text-(--purple-text)",
    orange: "bg-transparent border-(--orange) text-(--orange-text)",
    pink: "bg-transparent border-(--pink) text-(--pink-text)",
    warning:
      "bg-transparent border-(--color-status-warning) text-(--color-status-warning)",
  },
  ghost: {
    neutral: "bg-transparent border-transparent text-(--color-text-secondary)",
    subtle: "bg-transparent border-transparent text-(--color-text-muted)",
    red: "bg-transparent border-transparent text-(--color-status-danger)",
    amber: "bg-transparent border-transparent text-(--color-action-text)",
    blue: "bg-transparent border-transparent text-(--color-status-info)",
    green: "bg-transparent border-transparent text-(--color-status-success)",
    cyan: "bg-transparent border-transparent text-(--cyan-text)",
    purple: "bg-transparent border-transparent text-(--purple-text)",
    orange: "bg-transparent border-transparent text-(--orange-text)",
    pink: "bg-transparent border-transparent text-(--pink-text)",
    warning: "bg-transparent border-transparent text-(--color-status-warning)",
  },
  solid: {
    // Texto branco por escolha de marca (o escuro foi recusado em 13/11/2026).
    // Para o branco passar no WCAG 1.4.3, o FUNDO escurece: --color-action
    // (#a86608) dá 4,6:1; o --amber puro dava 3,2:1 e reprovava.
    amber:
      "bg-(--color-action) border-(--color-action) text-(--color-on-action)",
    neutral: "bg-(--color-text) border-(--color-text) text-white",
    subtle:
      "bg-(--color-text-secondary) border-(--color-text-secondary) text-white",
    red: "bg-(--color-status-danger) border-(--color-status-danger) text-white",
    blue: "bg-(--color-status-info) border-(--color-status-info) text-white",
    green:
      "bg-(--color-status-success) border-(--color-status-success) text-white",
    cyan: "bg-(--cyan-text) border-(--cyan-text) text-white",
    purple: "bg-(--purple) border-(--purple) text-white",
    orange: "bg-(--orange-text) border-(--orange-text) text-white",
    pink: "bg-(--pink) border-(--pink) text-white",
    warning:
      "bg-(--color-status-warning) border-(--color-status-warning) text-white",
  },
};

export const getThemeClasses = (
  appearance: ThemeAppearance,
  color: ThemeColor
): string => {
  return themeVariants[appearance]?.[color] ?? themeVariants.tinted.neutral;
};
