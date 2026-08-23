// Respiro lateral maior que o vertical: a linha ganha densidade sem as colunas
// se encostarem. `py-12` no lugar dos 16px de antes tira ~8px de altura por
// linha — numa página de 10, quase uma linha inteira a mais na tela.
// `whitespace-nowrap`: o dado ocupa uma linha só. Quando a soma das colunas não
// cabe, quem cede é a largura da tabela — o wrapper do `Table.Table` rola na
// horizontal — e não o nome do cliente, que virava duas ou três linhas e
// desalinhava a leitura vertical da lista. Uma célula que precise mesmo quebrar
// (texto livre) pede `whitespace-normal` na própria `Table.Cell`.
export const tableCellBase =
  "px-16 py-12 align-middle whitespace-nowrap border-b border-(--border) group-last:border-b-0";

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
