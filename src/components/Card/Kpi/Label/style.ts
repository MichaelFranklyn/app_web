// Quebra linha em vez de `truncate`: com a faixa em 2 colunas no celular, o
// cartão tem metade da tela e "Previsto em novembro de 2026" virava
// "Previsto em novembro de 2…" — o rótulo é o que diz o que o número é.
export const kpiLabelStyle =
  "text-body-sm text-(--color-text-secondary) font-body font-semibold leading-snug flex items-center gap-[6px] min-w-0";

// A palavra só quebra em sílaba (`hyphens-auto`, pelo `lang="pt-br"` do
// <html>): com `overflow-wrap:anywhere` sozinho, "Faturamento" num cartão de
// 360px (76px livres para 76,2px de texto) virava "Faturament/o". O `anywhere`
// continua como último recurso, para palavra sem sílaba que caiba.
export const kpiLabelTextStyle =
  "min-w-0 flex-1 hyphens-auto [overflow-wrap:anywhere]";

// Abaixo do tablet o cartão tem metade da tela: o quadrado do ícone desce de
// 32 para 24px e devolve ao texto o espaço de uma palavra comprida.
export const kpiLabelIconStyle =
  "ml-auto shrink-0 max-tablet:size-[24px] max-tablet:[&>svg]:size-[14px]";
