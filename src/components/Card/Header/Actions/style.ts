// Ações do cabeçalho de card/tabela, em 3 estágios escolhidos por medição do
// conteúdo real (ver useHeaderActionsMode; estágio no data-actions-mode do header):
//   • full   → linha, no tamanho natural, botões com ícone + texto.
//   • icon   → linha, no tamanho natural, botões só com ícone (o texto some via
//              [data-button-title]; o :has(>svg) evita esvaziar botões só-texto).
//   • column → tudo empilhado e full-width (inputs, botões, tags), um embaixo do
//              outro com gap de 8, cada item respeitando seu tamanho mínimo.
// Inclui o caso comum de um <div> interno agrupando os controles (ele também
// empilha no column). (Difere do actionsStyle compartilhado de Card.Item.Actions.)
export const headerActionsStyle = [
  // Base = estágio de linha (full/icon): natural, à direita.
  "flex w-auto flex-row flex-wrap items-center gap-8",
  "[&>div]:flex [&>div]:w-auto [&>div]:flex-row [&>div]:items-center [&>div]:gap-8",
  // Input de texto na linha: largura natural. Sobrescreve o `max-desktop:w-full`
  // do Input (regra por viewport) — dentro do header quem manda é o ESTÁGIO
  // (container), não o viewport; senão o input esticaria no meio da linha.
  "[&_[data-input-root]]:w-auto",
  // Estágio icon: esconde o texto dos botões que têm ícone.
  // `sr-only` e não `hidden`: o rótulo sai da tela, mas continua no nome
  // acessível do botão. Com `display:none` o leitor de tela (e o teste)
  // encontrava um botão sem nome nenhum — só um ícone.
  // O primário (solid) mantém o nome: "+" sozinho ao lado de "…" deixava o
  // vendedor adivinhar o que cria ("Nova tabela", crítica de 23/11/2026). Só
  // os secundários viram ícone.
  "group-data-[actions-mode=icon]/cardhead:[&_*:has(>svg):not([data-appearance=solid])>[data-button-title]]:sr-only",
  // Estágio column: empilha tudo full-width, cada item no seu mínimo.
  "group-data-[actions-mode=column]/cardhead:w-full",
  "group-data-[actions-mode=column]/cardhead:flex-col",
  "group-data-[actions-mode=column]/cardhead:items-stretch",
  "group-data-[actions-mode=column]/cardhead:[&>div]:w-full",
  "group-data-[actions-mode=column]/cardhead:[&>div]:flex-col",
  "group-data-[actions-mode=column]/cardhead:[&>div]:items-stretch",
  "group-data-[actions-mode=column]/cardhead:[&_[data-input-root]]:w-full",
  "group-data-[actions-mode=column]/cardhead:[&_[data-badge]]:w-full",
  "group-data-[actions-mode=column]/cardhead:[&_[data-badge]]:justify-center",
  // Esticada, a tag tem a largura da coluna e não pode mais crescer. O texto
  // dela (Badge.Text é `truncate`) cortava em "VENCIMENTOS CONTAM DO
  // FATURAME…", e a informação inteira se perdia. Aqui o texto quebra linha.
  "group-data-[actions-mode=column]/cardhead:[&_[data-badge]]:whitespace-normal",
  "group-data-[actions-mode=column]/cardhead:[&_[data-badge]]:text-center",
  "group-data-[actions-mode=column]/cardhead:[&_[data-badge]>span]:whitespace-normal",
].join(" ");
