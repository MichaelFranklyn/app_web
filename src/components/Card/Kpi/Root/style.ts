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
//
// Abaixo do tablet o respiro desce para 12px: com meia tela por cartão, os
// 20px de cada lado comiam o espaço do número e do rótulo — e cada tela
// compensava com o seu `className` (padrão de KPIs, 23/11/2026).
//
// `w-full`: o `Card.Kpi.Group` embrulha cada cartão num `Grid.Item`, e o
// cartão-filtro é um <button> — que, sem largura, encolhia ao conteúdo e
// virava uma tira de 40px com o rótulo letra a letra (/support, 23/11/2026).
//
// Faixa `compact` (`Card.Kpi.Group size="compact"`): respiro de 16/12 e 6px
// entre rótulo e número.
export const kpiRootStyle =
  "group-data-[size=compact]/kpi:px-16 group-data-[size=compact]/kpi:py-12 group-data-[size=compact]/kpi:max-tablet:px-12 group-data-[size=compact]/kpi:gap-6 @container h-full w-full border border-(--border) rounded-(--r-lg) shadow-(--shadow-card) px-20 py-[18px] max-tablet:px-12 max-tablet:py-12 bg-(--bg2) relative flex flex-col overflow-hidden gap-12";

/**
 * O cartão-filtro: âmbar porque é interação — a mesma cor de "escolhido" do
 * `ToggleGroup`.
 */
export const kpiInteractiveStyle =
  "cursor-pointer text-left transition-[border-color,box-shadow] duration-150 ease-(--ease-out-soft) hover:border-(--border2) hover:shadow-(--shadow-md) focus-ring";
export const kpiActiveStyle = "border-(--amber) bg-(--amber-bg)";
