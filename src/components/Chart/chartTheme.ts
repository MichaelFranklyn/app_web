// Tokens de cor dos gráficos, espelhando as CSS vars de styles/globals.css.
// ECharts recebe cores via JS (não classes Tailwind), então mantemos os hex
// aqui — SSR-safe e num único lugar. Âmbar é reservado à interação: NÃO é usado
// como cor de série (regra do projeto).

// Paleta categórica (ordem dos módulos), validada com scripts/validate_palette.js.
export const CHART_PALETTE = [
  "#2563c4", // identity / azul
  "#1a7a56", // clients / verde
  "#d05a0a", // factory / laranja
  "#7c3aed", // products / roxo
  "#0a7fa3", // routine / ciano
  "#be185d", // intel / rosa
  "#a08010", // orders / mostarda
  "#c0392b", // import / vermelho
];

export const SERIES_BLUE = "#2563c4";
export const SERIES_GREEN = "#1a7a56";
export const SERIES_ORANGE = "#d05a0a";
export const SERIES_PURPLE = "#7c3aed";
export const SERIES_CYAN = "#0a7fa3";
// Reservado a séries de sentido negativo (cancelado, atraso) — não à interação.
export const SERIES_RED = "#c0392b";

// Chrome do gráfico (eixos, grid, texto, tooltip) a partir dos neutros da marca.
export const CHART_INK = "#1a1a16"; // --text
export const CHART_INK_MUTED = "#7a7a6e"; // --muted
export const CHART_GRID = "#e2e1d8"; // --border (hairline)
export const CHART_SURFACE = "#ffffff"; // --bg2 (fundo do Card)

/** Grid enxuto, com respiro para os labels do eixo. */
export const baseGrid = {
  top: 24,
  right: 16,
  bottom: 28,
  left: 12,
  containLabel: true,
};

/** Eixo de categoria (linha base hairline, sem tick, texto mudo). */
export const categoryAxis = {
  type: "category" as const,
  axisLine: { lineStyle: { color: CHART_GRID } },
  axisTick: { show: false },
  axisLabel: { color: CHART_INK_MUTED, fontSize: 12 },
};

/** Eixo de valor (sem linha, só splitLines hairline sólidas). */
export const valueAxis = {
  type: "value" as const,
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: CHART_INK_MUTED, fontSize: 12 },
  splitLine: { lineStyle: { color: CHART_GRID, type: "solid" as const } },
};

/** Tooltip padrão (fundo claro, borda hairline, texto da marca). */
export const tooltipBase = {
  trigger: "axis" as const,
  backgroundColor: CHART_SURFACE,
  borderColor: CHART_GRID,
  borderWidth: 1,
  textStyle: { color: CHART_INK, fontSize: 12 },
  extraCssText: "box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-radius: 8px;",
};
