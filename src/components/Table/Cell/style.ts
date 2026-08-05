// Respiro lateral maior que o vertical: a linha ganha densidade sem as colunas
// se encostarem. `py-12` no lugar dos 16px de antes tira ~8px de altura por
// linha — numa página de 10, quase uma linha inteira a mais na tela.
export const tableCellBase =
  "px-16 py-12 align-middle border-b border-(--border) group-last:border-b-0";

export const tableCellFlex = "flex items-center gap-8";

// Números alinhados à direita: a vírgula cai na mesma coluna em toda a lista,
// e comparar valores vira leitura vertical em vez de conferência dígito a
// dígito. `tabular-nums` trava a largura do algarismo para o alinhamento não
// depender do dígito que calhou de aparecer.
export const tableCellAlignStyle = {
  left: "text-left",
  center: "text-center",
  right: "text-right tabular-nums",
} as const;

export const tableCellVariants = {
  default: "text-(--text2)",
  strong: "text-(--text) font-medium",
  mono: "font-mono text-(--text2)",
  dim: "text-(--muted) text-[13px]",
  dim2: "text-(--muted2) text-[13px]",
} as const;
