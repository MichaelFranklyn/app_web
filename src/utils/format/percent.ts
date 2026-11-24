/**
 * Porcentagem no formato brasileiro ("48%", "12,5%"). Antes cada tela montava a
 * sua: `toFixed(0)}%`, `Math.round(x * 100)}%`, `toFixed(1).replace(".", ",")`
 * — e uma esquecia a vírgula, outra truncava em vez de arredondar.
 *
 * Sem casas decimais por padrão: o público lê a ordem de grandeza, não a
 * precisão. Taxa (comissão, imposto) pede `decimals`.
 */
interface PercentOptions {
  /** "7,5%" em vez de "7,50%": as casas são teto, não piso. */
  trimZeros?: boolean;
}

const format = (
  value: number,
  decimals: number,
  { trimZeros = false }: PercentOptions
): string => {
  const factor = 10 ** decimals;
  // `|| 0` tira o "-0" que o arredondamento de -0,4 deixaria.
  const rounded = Math.round(value * factor) / factor || 0;
  return `${rounded.toLocaleString("pt-BR", {
    minimumFractionDigits: trimZeros ? 0 : decimals,
    maximumFractionDigits: decimals,
  })}%`;
};

/** Fração (0..1) → "47%". É o formato dos gráficos e relatórios. */
export const formatPercent = (
  fraction: number,
  decimals = 0,
  options: PercentOptions = {}
): string => format(fraction * 100, decimals, options);

/**
 * Valor que já vem em pontos percentuais (0..100, como o atingimento de meta
 * ou a alíquota de um imposto) → "47%" / "12,5%".
 */
export const formatPercentPoints = (
  points: number,
  decimals = 0,
  options: PercentOptions = {}
): string => format(points, decimals, options);
