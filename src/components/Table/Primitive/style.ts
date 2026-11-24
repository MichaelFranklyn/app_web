export const tablePrimitiveStyles = {
  wrapper: "w-full overflow-x-auto",
  table: "w-full border-collapse text-body-sm text-left",
  // Com maxHeight: scroll vertical na lista mantendo o cabeçalho (thead) fixo.
  // O `th` já tem bg-(--bg2), então o sticky não deixa as linhas vazarem.
  //
  // A borda de baixo vira `inset shadow` aqui: com `border-collapse: collapse`
  // a borda pertence à tabela, não ao `th`, e não acompanha o cabeçalho quando
  // ele descola — a linha de títulos ficava flutuando sobre os dados sem nada
  // separando os dois. A sombra é pintada pelo próprio `th` e vai junto.
  scroll:
    "max-h-(--table-max-h) overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-(--z-raised) [&_thead_th]:shadow-[inset_0_-1px_0_var(--border)]",
  // `cards`: abaixo do desktop a lista é de cartões e rola com a página.
  scrollDesktopOnly:
    "desktop:max-h-(--table-max-h) desktop:overflow-y-auto desktop:[&_thead]:sticky desktop:[&_thead]:top-0 desktop:[&_thead]:z-(--z-raised) desktop:[&_thead_th]:shadow-[inset_0_-1px_0_var(--border)]",
};
