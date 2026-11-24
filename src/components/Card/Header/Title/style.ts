/**
 * Um título de card só (23/11/2026): 15px, negrito — antes cada tela escolhia
 * entre `bold` e `semibold` e repetia `size="sm"`. Não trunca: o nome longo
 * quebra linha, como o texto das tabelas (público idoso não adivinha o que o
 * "…" escondeu). Selo ou "?" ao lado do texto vêm alinhados pelo próprio
 * título (flex + gap) e descem para a linha de baixo quando não cabem.
 */
export const titleStyle =
  "font-head flex min-w-0 flex-wrap items-center gap-x-6 gap-y-4 text-body-md font-(--weight-bold) tracking-[-0.01em] text-(--color-text) [overflow-wrap:anywhere]";
