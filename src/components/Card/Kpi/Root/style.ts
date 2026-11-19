// `h-full`: o cartão preenche a altura da linha do grid. Sem isso, o irmão cujo
// texto de apoio quebrou em duas linhas ficava mais alto que os demais.
//
// Sem `justify-between`: rótulo e número ficam ancorados no TOPO e é o delta que
// desce (`mt-auto`, no próprio componente). Com a distribuição anterior, um
// delta de duas linhas empurrava o número daquele cartão alguns pixels para
// cima — e a fileira, que só funciona lida de um golpe, saía desalinhada.
//
// `@container`: o número mede o PRÓPRIO cartão (ver kpiValueStyle) — no celular
// a faixa vai em 2 colunas e o cartão tem metade da tela.
export const kpiRootStyle =
  "@container h-full border border-(--border) rounded-(--r-lg) shadow-(--shadow-card) px-20 py-[18px] bg-(--bg2) relative flex flex-col overflow-hidden gap-12";

/**
 * O cartão-filtro: âmbar porque é interação — a mesma cor de "escolhido" do
 * `ToggleGroup`.
 */
export const kpiInteractiveStyle =
  "cursor-pointer text-left transition-[border-color,box-shadow] duration-150 ease-(--ease-out-soft) hover:border-(--border2) hover:shadow-(--shadow-md) focus-ring";
export const kpiActiveStyle = "border-(--amber) bg-(--amber-bg)";
