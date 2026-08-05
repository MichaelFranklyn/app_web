export const tablePrimitiveStyles = {
  wrapper: "w-full overflow-x-auto",
  table: "w-full border-collapse text-[13px] text-left",
  // Com maxHeight: scroll vertical na lista mantendo o cabeçalho (thead) fixo.
  // O `th` já tem bg-(--bg2), então o sticky não deixa as linhas vazarem.
  //
  // A borda de baixo vira `inset shadow` aqui: com `border-collapse: collapse`
  // a borda pertence à tabela, não ao `th`, e não acompanha o cabeçalho quando
  // ele descola — a linha de títulos ficava flutuando sobre os dados sem nada
  // separando os dois. A sombra é pintada pelo próprio `th` e vai junto.
  scroll:
    "overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-[1] [&_thead_th]:shadow-[inset_0_-1px_0_var(--border)]",
};
