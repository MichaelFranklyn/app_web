// `h-full`: o cartão preenche a altura da linha do grid. Sem isso, o irmão cujo
// texto de apoio quebrou em duas linhas ficava mais alto que os demais.
//
// Sem `justify-between`: rótulo e número ficam ancorados no TOPO e é o delta que
// desce (`mt-auto`, no próprio componente). Com a distribuição anterior, um
// delta de duas linhas empurrava o número daquele cartão alguns pixels para
// cima — e a fileira, que só funciona lida de um golpe, saía desalinhada.
export const kpiRootStyle =
  "h-full border border-(--border) rounded-(--r-lg) px-[18px] py-16 bg-(--bg2) relative flex flex-col overflow-hidden gap-[14px]";
