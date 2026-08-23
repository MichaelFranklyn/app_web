// Ações do header de página, nos mesmos 3 estágios do Card.Header — escolhidos
// por MEDIÇÃO do conteúdo real (ver useHeaderActionsMode), não por breakpoint de
// viewport. Aqui as ações ficam numa linha própria abaixo do título, então a
// régua é só o quanto elas mesmas ocupam:
//   • full   → cabem na linha com ícone + texto.
//   • icon   → só cabem sem o texto (escondido via [data-button-title]).
//   • column → nem só com ícone cabem: empilham full-width.
// `group/panelhead` nomeia o grupo para o wrapper interno ler o estágio.

// Externo: ocupa a linha inteira e é a fonte da largura disponível.
export const panelActionsWrapperStyle = "group/panelhead flex w-full";

// Interno: é o que se mede. Nos estágios de linha fica no tamanho natural
// (`w-auto shrink-0`, sem wrap), então offsetWidth revela o quanto as ações
// precisam de fato — inclusive quando transbordam.
export const panelActionsStyle = [
  "flex w-auto shrink-0 flex-row flex-nowrap items-center gap-8",
  // Abaixo de desktop, Input e wrappers de controle carregam `w-full` por
  // viewport; nos estágios de linha quem manda é o ESTÁGIO (container), senão
  // eles esticariam no meio da linha e a medição viraria circular. No desktop a
  // regra não entra, e a largura definida no uso (containerClassName) é mantida.
  "max-desktop:[&_[data-input-root]]:w-auto",
  "max-desktop:[&>div]:w-auto",
  // Estágio icon: esconde o texto dos botões que têm ícone (o :has(>svg) evita
  // esvaziar botões só-texto, que ficariam sem rótulo nenhum).
  // `sr-only` e não `hidden`: o rótulo sai da tela, mas continua no nome
  // acessível do botão. Com `display:none` o leitor de tela (e o teste)
  // encontrava um botão sem nome nenhum — só um ícone.
  "group-data-[actions-mode=icon]/panelhead:[&_*:has(>svg)>[data-button-title]]:sr-only",
  // Estágio column: empilha tudo full-width, cada item no seu mínimo. Inclui o
  // caso comum de um <div> interno agrupando controles (ele também empilha).
  "group-data-[actions-mode=column]/panelhead:w-full",
  "group-data-[actions-mode=column]/panelhead:flex-col",
  "group-data-[actions-mode=column]/panelhead:items-stretch",
  "group-data-[actions-mode=column]/panelhead:[&>div]:w-full",
  "group-data-[actions-mode=column]/panelhead:[&>div]:flex-col",
  "group-data-[actions-mode=column]/panelhead:[&>div]:items-stretch",
  "group-data-[actions-mode=column]/panelhead:[&_[data-input-root]]:w-full",
  "group-data-[actions-mode=column]/panelhead:[&_[data-badge]]:w-full",
  "group-data-[actions-mode=column]/panelhead:[&_[data-badge]]:justify-center",
].join(" ");
