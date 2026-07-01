export const inputStyles = {
  // max-desktop:w-full → no mobile/tablet todo input ocupa a largura total
  // (inclusive em modais e qualquer lugar), sobrepondo larguras fixas; no
  // desktop volta ao definido pelo uso (containerClassName).
  wrap: "flex flex-col gap-[5px] max-desktop:w-full",
  label: "font-mono text-[13px] text-(--muted) tracking-[0.08em] uppercase",
  controlBase:
    "font-mono text-[13px] bg-(--bg3) text-(--text) py-[8px] px-[12px] outline-none w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none",
  controlBordered:
    "border border-(--border) rounded-(--r-md) focus:border-(--amber) focus:ring-[3px] focus:ring-(--amber-bg)",
  controlGrouped:
    "border-none rounded-none bg-transparent focus:ring-0 focus:border-none",

  error: "border-(--red) focus:border-(--red) focus:ring-(--red-bg)",
  success: "border-(--green) focus:border-(--green) focus:ring-(--green-bg)",

  hint: "font-mono text-[13px] text-(--muted)",
  hintError: "text-(--red)",

  group:
    "flex border border-(--border) rounded-(--r-md) overflow-hidden bg-(--bg3) focus-within:border-(--amber) focus-within:ring-[3px] focus-within:ring-(--amber-bg) transition-colors",
  groupError:
    "border-(--red) focus-within:border-(--red) focus-within:ring-(--red-bg)",
  groupSuccess:
    "border-(--green) focus-within:border-(--green) focus-within:ring-(--green-bg)",

  addon:
    "py-[8px] px-[12px] bg-(--bg4) border-r border-(--border) text-(--muted) text-[13px] flex items-center whitespace-nowrap [&>svg]:size-[14px] [&>svg]:shrink-0",

  textarea: "resize-y min-h-[80px]",
};

export const checkStyles = {
  wrap: "flex items-center gap-[8px] cursor-pointer text-[13px] text-(--text2) select-none",
  input: "peer/check sr-only",
  box: "flex items-center justify-center w-[16px] h-[16px] border-[1.5px] border-(--border2) rounded-(--r-xs) bg-(--bg3) shrink-0 transition-all duration-[120ms] peer-checked/check:[&>svg]:!block",
  // Cor quando marcado. amber = padrão (seleção); green = ação concluída/sucesso.
  boxTone: {
    amber:
      "peer-checked/check:bg-(--amber) peer-checked/check:border-(--amber)",
    green:
      "peer-checked/check:bg-(--green) peer-checked/check:border-(--green)",
  },
  mark: "text-white text-[13px] hidden",
};

export const radioStyles = {
  wrap: "flex items-center gap-[8px] cursor-pointer text-[13px] text-(--text2) select-none",
  input: "peer/radio sr-only",
  box: "flex items-center justify-center w-[16px] h-[16px] border-[1.5px] border-(--border2) rounded-full bg-(--bg3) shrink-0 transition-all duration-[120ms] peer-checked/radio:border-(--amber) peer-checked/radio:[&>div]:!block",
  dot: "w-[7px] h-[7px] rounded-full bg-(--amber) hidden",
};

export const toggleStyles = {
  wrap: "flex items-center gap-[10px] cursor-pointer text-[13px] text-(--text2) select-none",
  input: "peer/toggle sr-only",
  track:
    "relative w-[36px] h-[20px] bg-(--bg4) border border-(--border2) rounded-[10px] shrink-0 transition-colors duration-[150ms] peer-checked/toggle:bg-(--amber3) peer-checked/toggle:border-(--amber3) peer-checked/toggle:[&>div]:translate-x-[16px] peer-checked/toggle:[&>div]:bg-(--amber)",
  thumb:
    "absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-(--muted2) rounded-full transition-all duration-[150ms]",
};

export const selectStyles = {
  overlay:
    "bg-(--bg2) border border-(--border) rounded-(--r-md) shadow-lg z-[9999] max-h-[240px] overflow-auto focus:outline-none flex flex-col p-[4px] gap-[2px]",
  optionBox:
    "px-[12px] py-[8px] cursor-pointer hover:bg-(--bg3) rounded-(--r-sm) flex items-center gap-[8px] text-[13px] text-(--text) transition-colors data-[selected=true]:bg-(--amber-bg)",
  optionCheckboxWrap: "flex items-center gap-[8px] w-full",
  warningText: "p-[8px] text-[13px] text-(--muted) text-center w-full",
  inputFlex: "flex flex-1 flex-wrap items-center gap-[4px] min-w-0",
  clearIcon:
    "cursor-pointer p-[4px] rounded-full hover:bg-(--bg3) text-(--muted) transition-colors",
  dropdownIcon:
    "cursor-pointer p-[2px] text-(--muted) transition-transform duration-200",
};

export const calendarStyles = {
  overlay:
    "flex bg-(--bg2) border border-(--border) rounded-(--r-md) shadow-lg z-50 overflow-hidden",
  sidebar:
    "w-[140px] border-r border-(--border) bg-(--bg3) hidden tablet:flex flex-col p-[8px] gap-[4px]",
  sidebarButton:
    "w-full text-left px-[12px] py-[8px] text-[13px] text-(--text2) rounded-(--r-sm) hover:bg-(--bg4) hover:text-(--text) transition-colors cursor-pointer",

  wrapper: "p-[12px]",
  months:
    "flex flex-col tablet:flex-row space-y-[16px] tablet:space-x-[16px] tablet:space-y-0",
  month: "space-y-[16px]",
  month_caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-[14px] font-medium text-(--text) font-mono",
  nav: "space-x-[4px] flex items-center absolute flex-row w-full justify-between",
  button_previous:
    "h-[28px] w-[28px] bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center text-(--text) rounded-(--r-sm) hover:bg-(--bg4) transition-colors cursor-pointer",
  button_next:
    "h-[28px] w-[28px] bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center text-(--text) rounded-(--r-sm) hover:bg-(--bg4) transition-colors cursor-pointer",
  month_grid: "w-full border-collapse space-y-[4px]",
  weekdays: "flex",
  weekday:
    "text-(--muted) rounded-md w-[36px] font-normal text-[13px] h-[36px] flex items-center justify-center",
  week: "flex w-full mt-[8px]",

  dropdowns: "flex gap-[6px] items-center",
  dropdown:
    "bg-(--bg3) border border-(--border) rounded-(--r-sm) text-[13px] text-(--text) px-[6px] py-[4px] font-mono cursor-pointer hover:border-(--amber) focus:outline-none focus:border-(--amber)",
  months_dropdown: "",
  years_dropdown: "",

  day: "h-[36px] w-[36px] text-center text-[13px] p-0 font-medium relative hover:bg-(--bg4) hover:text-(--text) focus:z-10 bg-transparent rounded-(--r-sm) transition-colors cursor-pointer",
  day_button:
    "h-[36px] w-[36px] text-center text-[13px] p-0 font-medium relative focus:z-10 focus:outline-none flex justify-center items-center rounded-md text-(--text) cursor-pointer",

  selected:
    "!bg-(--amber) !text-[#ffffff] hover:!bg-(--amber) hover:!text-[white] focus:!bg-(--amber) focus:!text-white !rounded-(--r-sm)",
  outside:
    "text-(--muted) opacity-50 pointer-events-none hover:bg-transparent hover:text-(--muted)",
  disabled:
    "text-(--muted) opacity-50 hover:bg-transparent hover:text-(--muted) cursor-not-allowed",

  range_middle:
    "!bg-(--amber-bg) !text-(--amber) !rounded-none hover:!bg-(--amber-bg)",
  range_start:
    "!bg-(--amber) !text-[#ffffff] hover:!bg-(--amber) hover:!text-[#ffffff] !rounded-l-(--r-sm) !rounded-r-none",
  range_end:
    "!bg-(--amber) !text-[#ffffff] hover:!bg-(--amber) hover:!text-[#ffffff] !rounded-r-(--r-sm) !rounded-l-none",
  today: "font-bold text-(--amber) underline underline-offset-4",
};
