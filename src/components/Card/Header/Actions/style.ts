// Ações do cabeçalho de card/tabela. Header estreito (<480px): tudo empilhado e
// full-width — inputs, botões e tags, um embaixo do outro com gap de 8. Inclui o
// caso comum de um <div> interno agrupando os controles (ele também empilha).
// Header largo: volta para linha, no tamanho natural (larguras fixas preservadas,
// pois os overrides de full-width são só @max). Usa o container query @cardhead.
// (Difere do actionsStyle compartilhado de Card.Item.Actions.)
export const headerActionsStyle = [
  "flex w-full flex-col items-stretch gap-8",
  // Empilha o agrupador interno (ex.: <div className="flex gap-8">) no estreito.
  "[&>div]:flex [&>div]:w-full [&>div]:flex-col [&>div]:items-stretch [&>div]:gap-8",
  // Força full-width em inputs (mesmo com largura fixa) e tags só no estreito.
  "@max-[480px]/cardhead:[&_[data-input-root]]:w-full",
  "@max-[480px]/cardhead:[&_[data-badge]]:w-full @max-[480px]/cardhead:[&_[data-badge]]:justify-center",
  // Header largo: linha natural; o agrupador interno volta a ser linha.
  "@min-[480px]/cardhead:w-auto @min-[480px]/cardhead:flex-row @min-[480px]/cardhead:flex-wrap @min-[480px]/cardhead:items-center",
  "@min-[480px]/cardhead:[&>div]:w-auto @min-[480px]/cardhead:[&>div]:flex-row @min-[480px]/cardhead:[&>div]:items-center",
].join(" ");
