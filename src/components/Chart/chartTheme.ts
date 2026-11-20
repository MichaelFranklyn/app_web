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
export const CHART_INK = "#1a1a16"; // --color-text
export const CHART_INK_MUTED = "#7a7a6e"; // --color-text-muted
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
  // hideOverlap: no celular as barras deitadas têm ~200px de eixo; sem isso
  // os rótulos encavalavam ("R$ 2R$ 4R$ 6…").
  axisLabel: { color: CHART_INK_MUTED, fontSize: 12, hideOverlap: true },
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

const compactNumber = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

/** Dinheiro curto para eixo: "R$ 20 mil", "R$ 1,2 mi", "R$ 500". */
export const compactMoneyLabel = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000)
    return `R$ ${compactNumber.format(value / 1_000_000)} mi`;
  if (abs >= 1_000) return `R$ ${compactNumber.format(value / 1_000)} mil`;
  return `R$ ${compactNumber.format(value)}`;
};

/**
 * Formatador de rótulo de eixo a partir do formatador do valor. Dinheiro vira
 * o formato curto ("R$ 100.000,00" ocupava ~90px no celular e encavalava nas
 * barras deitadas); o valor exato continua no tooltip. Outras grandezas
 * (dias, %, contagem) passam como vieram.
 */
export const axisLabelFormatter =
  (format: (value: number) => string) =>
  (value: number): string => {
    const text = format(value);
    return text.includes("R$") ? compactMoneyLabel(value) : text;
  };
