/**
 * Os passos do wizard, com nome.
 *
 * Eles moram aqui porque a trilha que a pessoa vê é maior do que este
 * componente: quem abre a importação já andou um ou dois passos antes (escolher
 * o caminho, dizer de quem é o pedido). O pai prefixa os passos dele a estes —
 * e é por isso que os rótulos não podem ser dois textos soltos em dois lugares,
 * senão a faixa mostra "Arquivo" duas vezes ou pula um número.
 */
export const STEP_LABEL = {
  file: "Arquivo",
  columns: "Colunas",
  review: "Revisão",
  result: "Resultado",
} as const;

/** Arquivo de fábrica: descobrir o que ele tem antes de gravar. */
export const FILE_STEPS = [
  STEP_LABEL.file,
  STEP_LABEL.columns,
  STEP_LABEL.review,
  STEP_LABEL.result,
] as const;

/**
 * Ficha do sistema: subir e conferir são o mesmo passo — o arquivo é nosso e
 * não há coluna a apontar nem produto a casar na mão.
 */
export const SHEET_STEPS = [STEP_LABEL.file, STEP_LABEL.result] as const;
