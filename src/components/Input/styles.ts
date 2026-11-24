export type InputSize = "xs" | "sm" | "md" | "lg";

// Espelha Button e Badge (mesmos padY por size), para que input, botão e tag
// fiquem com a MESMA altura quando usados lado a lado.
// Altura = line-height (1.6 × 13px = 20.8) + 2×padY + 2×borda.
export const inputSizePadding: Record<InputSize, string> = {
  lg: "py-[11px] px-20",
  md: "py-8 px-12",
  sm: "py-5 px-12",
  xs: "py-3 px-8",
};

// Piso de altura para os controles que são <div> (Select/Date), onde não há
// caixa de texto garantindo a linha. Só fora de Group: dentro dele a borda é do
// grupo, e o piso somaria os 2px dela por cima da altura já correta.
export const inputSizeMinHeight: Record<InputSize, string> = {
  lg: "min-h-[44.8px]",
  md: "min-h-[38.8px]",
  sm: "min-h-[32.8px]",
  xs: "min-h-[28.8px]",
};

// `lg` é o tamanho de TOQUE: além dos ~44px de altura, 16px de texto. Abaixo
// disso o Safari do iPhone dá zoom automático ao focar o campo — e é nas telas
// abertas no celular (portal do cliente, folha de resposta da rota) que ele vive.
export const inputSizeText: Record<InputSize, string> = {
  lg: "text-body-lg",
  md: "",
  sm: "",
  xs: "",
};

export const inputStyles = {
  // max-desktop:w-full → no mobile/tablet todo input ocupa a largura total
  // (inclusive em modais e qualquer lugar), sobrepondo larguras fixas; no
  // desktop volta ao definido pelo uso (containerClassName).
  wrap: "flex flex-col gap-5 max-desktop:w-full",
  // Caixa mista e peso médio: o rótulo em CAIXA ALTA espaçada se lia como
  // sigla e cansava o público mais velho. A caixa alta fica para eyebrow e
  // seção (que não são perguntas ao usuário).
  label:
    "font-body text-body-sm font-(--weight-medium) text-(--color-text-secondary)",
  // Desabilitado: o fundo sai do --bg3 (campo) para o --bg (o da página), a
  // borda vira tracejada e o texto vai para --color-text-muted. Antes era só
  // `opacity-50` sobre o mesmo cinza do campo, e o travado parecia um editável
  // desbotado. O texto é --color-text-muted, e não --color-text-disabled: o valor de um campo travado
  // ainda precisa ser lido (5:1 no --bg; o --color-text-disabled dá 2,4:1).
  controlBase:
    "font-body text-body-sm bg-(--bg3) text-(--color-text) outline-none w-full transition-colors disabled:bg-(--bg) disabled:text-(--color-text-muted) disabled:border-dashed disabled:cursor-not-allowed appearance-none",
  // O mesmo desabilitado para Select e Date, cujo wrapper é uma <div> (o
  // `disabled:` não dispara nela): aplicado por condição no componente.
  controlDisabled:
    "bg-(--bg) text-(--color-text-muted) border-dashed cursor-not-allowed",
  // Borda do campo = --color-border-control (≥3:1, WCAG 1.4.11). O --border
  // (1,3:1) é de divisória: no campo, o limite do controle sumia.
  controlBordered:
    "border border-(--color-border-control) rounded-(--r-md) hover:border-(--color-text-secondary) focus:border-(--color-action) focus:ring-[3px] focus:ring-(--amber)/25 transition-[border-color,box-shadow,background-color] duration-150",
  // Select e Date: o wrapper é uma <div> e quem recebe o foco é o <input>
  // interno (sem outline próprio) — `focus:` na div nunca dispara, então o
  // anel tem de vir do `focus-within`. Sem isso o campo não mostrava foco.
  controlBorderedWithin:
    "border border-(--color-border-control) rounded-(--r-md) hover:border-(--color-text-secondary) focus-within:border-(--color-action) focus-within:ring-[3px] focus-within:ring-(--amber)/25 transition-[border-color,box-shadow,background-color] duration-150",
  controlGrouped:
    "border-none rounded-none bg-transparent focus:ring-0 focus:border-none",

  error:
    "border-(--color-status-danger) hover:border-(--color-status-danger) focus:border-(--color-status-danger) focus:ring-(--color-status-danger)/20 focus-within:border-(--color-status-danger) focus-within:ring-(--color-status-danger)/20",
  success:
    "border-(--color-status-success) hover:border-(--color-status-success) focus:border-(--color-status-success) focus:ring-(--color-status-success)/20 focus-within:border-(--color-status-success) focus-within:ring-(--color-status-success)/20",

  hint: "font-body text-body-sm text-(--color-text-muted)",
  hintError: "text-(--color-status-danger)",

  group:
    "flex border border-(--color-border-control) rounded-(--r-md) overflow-hidden bg-(--bg3) hover:border-(--color-text-secondary) focus-within:border-(--color-action) focus-within:ring-[3px] focus-within:ring-(--amber)/25 transition-[border-color,box-shadow] duration-150",
  groupError:
    "border-(--color-status-danger) hover:border-(--color-status-danger) focus-within:border-(--color-status-danger) focus-within:ring-(--color-status-danger)/20",
  groupSuccess:
    "border-(--color-status-success) hover:border-(--color-status-success) focus-within:border-(--color-status-success) focus-within:ring-(--color-status-success)/20",

  addon:
    "bg-(--bg4) border-r border-(--border) text-(--color-text-muted) text-body-sm flex items-center whitespace-nowrap [&>svg]:size-[14px] [&>svg]:shrink-0",

  textarea: "resize-y min-h-[80px]",
};

export const checkStyles = {
  // `relative` NÃO é decoração: o input é `sr-only`, que é
  // `position: absolute`. Sem um ancestral posicionado ele se ancora no
  // documento, e numa lista longa cada linha estica a página além da viewport —
  // aparece como um segundo scroll que nunca termina (bug na tela de comissões).
  // `min-h-24 min-w-24`: o alvo é o label inteiro (o input escondido mede 1px).
  // Sem texto, o label era só a caixa de 16px — abaixo dos 24px (WCAG 2.5.8).
  wrap: "group/check relative flex min-h-24 min-w-24 items-center gap-8 cursor-pointer text-body-sm text-(--color-text-secondary) select-none",
  input: "peer/check sr-only",
  box: "flex items-center justify-center w-[16px] h-[16px] border-[1.5px] border-(--border2) rounded-(--r-xs) bg-(--bg3) shrink-0 transition-[background-color,border-color] duration-[120ms] group-hover/check:border-(--color-border-control) peer-checked/check:[&>svg]:block peer-focus-visible/check:outline-2 peer-focus-visible/check:outline-offset-2 peer-focus-visible/check:outline-(--amber)",
  // Cor quando marcado. amber = padrão (seleção); green = ação concluída/sucesso.
  boxTone: {
    amber:
      "peer-checked/check:bg-(--amber) peer-checked/check:border-(--amber)",
    green:
      "peer-checked/check:bg-(--color-status-success) peer-checked/check:border-(--color-status-success)",
  },
  mark: "text-(--color-on-action) text-body-sm hidden",
};

export const radioStyles = {
  // Mesmo motivo do checkbox: o input `sr-only` precisa se ancorar aqui.
  wrap: "relative flex min-h-24 min-w-24 items-center gap-8 cursor-pointer text-body-sm text-(--color-text-secondary) select-none",
  input: "peer/radio sr-only",
  box: "flex items-center justify-center w-[16px] h-[16px] border-[1.5px] border-(--border2) rounded-full bg-(--bg3) shrink-0 transition-colors duration-[120ms] peer-checked/radio:border-(--amber) peer-checked/radio:[&>div]:block peer-focus-visible/radio:outline-2 peer-focus-visible/radio:outline-offset-2 peer-focus-visible/radio:outline-(--amber)",
  dot: "w-[7px] h-[7px] rounded-full bg-(--amber) hidden",
};

export const toggleStyles = {
  // Mesmo motivo do checkbox: o input `sr-only` precisa se ancorar aqui.
  wrap: "relative flex items-center gap-10 cursor-pointer text-body-sm text-(--color-text-secondary) select-none",
  input: "peer/toggle sr-only",
  track:
    "relative w-[36px] h-[20px] bg-(--bg4) border border-(--border2) rounded-[10px] shrink-0 transition-colors duration-[150ms] peer-checked/toggle:bg-(--amber3) peer-checked/toggle:border-(--amber3) peer-checked/toggle:[&>div]:translate-x-[16px] peer-checked/toggle:[&>div]:bg-(--amber)",
  thumb:
    "absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-(--color-text-disabled) rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[translate,background-color] duration-200 ease-(--ease-out-soft)",
};

export const selectStyles = {
  overlay:
    "bg-(--bg2) border border-(--border) rounded-(--r-md) shadow-(--shadow-md) z-(--z-popover) max-h-[240px] overflow-auto flex flex-col p-4 gap-2 animate-fade-in",
  optionBox:
    "px-12 py-8 cursor-pointer hover:bg-(--bg3) rounded-(--r-sm) flex items-center gap-8 text-body-sm text-(--color-text) transition-colors data-[selected=true]:bg-(--amber-bg) data-[active=true]:bg-(--bg3) data-[active=true]:outline data-[active=true]:outline-2 data-[active=true]:-outline-offset-2 data-[active=true]:outline-(--amber)",
  optionCheckboxWrap: "flex items-center gap-8 w-full",
  warningText: "p-8 text-body-sm text-(--color-text-muted) text-center w-full",
  inputFlex: "flex flex-1 flex-wrap items-center gap-4 min-w-0",
  clearIcon:
    "cursor-pointer p-4 rounded-full hover:bg-(--bg3) text-(--color-text-muted) transition-colors",
  dropdownIcon:
    "cursor-pointer p-2 text-(--color-text-muted) transition-transform duration-200",
};

export const calendarStyles = {
  overlay:
    "flex bg-(--bg2) border border-(--border) rounded-(--r-md) shadow-(--shadow-md) z-(--z-popover) overflow-hidden animate-fade-in",
  sidebar:
    "w-[140px] border-r border-(--border) bg-(--bg3) hidden tablet:flex flex-col p-8 gap-4",
  sidebarButton:
    "w-full text-left px-12 py-8 text-body-sm text-(--color-text-secondary) rounded-(--r-sm) hover:bg-(--bg4) hover:text-(--color-text) transition-colors cursor-pointer",

  wrapper: "p-12",
  months:
    "flex flex-col tablet:flex-row space-y-16 tablet:space-x-16 tablet:space-y-0",
  month: "space-y-16",
  month_caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-body font-medium text-(--color-text) font-body",
  nav: "space-x-4 flex items-center absolute flex-row w-full justify-between",
  button_previous:
    "h-[28px] w-[28px] bg-transparent p-0 flex items-center justify-center text-(--color-text-muted) hover:text-(--color-text) rounded-(--r-sm) hover:bg-(--bg4) transition-colors cursor-pointer",
  button_next:
    "h-[28px] w-[28px] bg-transparent p-0 flex items-center justify-center text-(--color-text-muted) hover:text-(--color-text) rounded-(--r-sm) hover:bg-(--bg4) transition-colors cursor-pointer",
  month_grid: "w-full border-collapse space-y-4",
  weekdays: "flex",
  weekday:
    "text-(--color-text-muted) rounded-(--r-md) w-[36px] font-normal text-body-sm h-[36px] flex items-center justify-center",
  week: "flex w-full mt-8",

  dropdowns: "flex gap-6 items-center",
  dropdown:
    "bg-(--bg3) border border-(--border) rounded-(--r-sm) text-body-sm text-(--color-text) px-6 py-4 font-body cursor-pointer hover:border-(--amber) focus-ring focus:border-(--amber)",
  months_dropdown: "",
  years_dropdown: "",

  /**
   * O dia (`<td>`) se pinta pelos atributos que o react-day-picker já põe nele
   * (`data-selected`, `data-today`, `data-outside`, `data-disabled`) e por três
   * classes-marcador do período (`cal-range-*`, ver `CalendarBase`), sem
   * `!important`: cada estado é um seletor mais específico que o anterior, e
   * nenhum disputa a mesma propriedade com o outro no mesmo nível.
   *
   * O botão interno não tem cor própria — herda a do `<td>` (preflight dá
   * `color: inherit` ao botão) —, senão a cor do estado nunca chegava ao número.
   */
  day: [
    "h-[36px] w-[36px] p-0 text-center text-body-sm font-medium relative rounded-(--r-sm) text-(--color-text) transition-colors cursor-pointer focus-within:z-(--z-raised) hover:bg-(--bg4)",
    // Hoje: sublinhado; a cor âmbar só quando o dia não está marcado.
    "data-today:font-bold data-today:underline data-today:underline-offset-4 [&[data-today]:not([data-selected])]:text-(--color-action-text)",
    // Marcado (dia avulso ou ponta do período).
    "[&[data-selected]:not(.cal-range-middle)]:bg-(--amber) [&[data-selected]:not(.cal-range-middle)]:text-(--color-on-action)",
    // Miolo do período: fundo claro, sem cantos.
    "[&.cal-range-middle[data-selected]]:bg-(--amber-bg) [&.cal-range-middle[data-selected]]:text-(--color-action-text-on-tint) [&.cal-range-middle]:rounded-none",
    // Pontas do período: arredonda só o lado de fora.
    "[&.cal-range-start:not(.cal-range-end)]:rounded-r-none [&.cal-range-end:not(.cal-range-start)]:rounded-l-none",
    // Fora do mês e desabilitado: apagados, sem realce no hover.
    "data-outside:text-(--color-text-disabled) data-outside:pointer-events-none",
    "data-disabled:text-(--color-text-disabled) data-disabled:cursor-not-allowed [&[data-disabled]:hover]:bg-transparent",
  ].join(" "),
  day_button:
    "h-[36px] w-[36px] text-center text-body-sm p-0 font-medium relative focus:z-(--z-raised) focus-ring flex justify-center items-center rounded-(--r-md) cursor-pointer",
};
