export const tablePrimitiveStyles = {
  wrapper: "w-full overflow-x-auto",
  table: "w-full border-collapse text-[13px] text-left",
  // Com maxHeight: scroll vertical na lista mantendo o cabeçalho (thead) fixo.
  // O `th` já tem bg-(--bg2), então o sticky não deixa as linhas vazarem.
  scroll: "overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-[1]",
};
