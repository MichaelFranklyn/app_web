export type ScoreColor = "red" | "orange" | "amber" | "blue" | "green";

/** Preenchimento da barra: gráfico, basta 3:1 — os tons puros servem. */
export const SCORE_COLOR_MAP: Record<ScoreColor, string> = {
  red: "var(--color-status-danger)",
  orange: "var(--orange)",
  amber: "var(--amber)",
  blue: "var(--color-status-info)",
  green: "var(--color-status-success)",
};

/**
 * O NÚMERO ao lado da barra é texto (≥ 4,5:1). O --amber puro dava 3,21 e o
 * --orange 4,08 no branco (axe no navegador em /clients, 13/11/2026); aqui
 * cada tom vai para a sua versão de texto.
 */
export const SCORE_TEXT_COLOR_MAP: Record<ScoreColor, string> = {
  red: "var(--color-status-danger)",
  orange: "var(--color-status-warning)",
  amber: "var(--color-action-text)",
  blue: "var(--color-status-info)",
  green: "var(--color-status-success)",
};
