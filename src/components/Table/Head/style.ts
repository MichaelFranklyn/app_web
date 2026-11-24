import { TableHeadAlign } from "./interface";

// Rótulo, não dado: menor e mais espaçado que o corpo, para a linha de títulos
// não competir com o conteúdo. `--color-text-muted` (e não `--color-text-disabled`) porque o cabeçalho
// agora é clicável — precisa de contraste que convide ao clique.
//
// `desktop:whitespace-normal`: no desktop o TÍTULO de duas palavras desce para
// a segunda linha quando a tabela aperta. Medido nas telas: "Preço sem
// impostos" ocupava 186px para mostrar "R$ 1.250,00", e "Último faturamento",
// 198px para uma data — era o cabeçalho, e não o dado, que empurrava a tabela
// para a rolagem lateral. Abaixo do desktop segue em uma linha (lá a tabela
// rola com o dedo, e título quebrado só gastaria altura).
export const tableHeadStyle =
  "px-16 desktop:px-12 desktop-xl:px-16 py-10 pointer-coarse:py-[14px] text-body-sm font-(--weight-semibold) text-(--color-text-muted) border-b border-(--border) bg-(--bg2) whitespace-nowrap desktop:whitespace-normal";

export const tableHeadAlignStyle: Record<TableHeadAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Herda a tipografia do `th`. O par `-mx-6 px-6` alarga a área de clique sem
// deslocar o texto em relação às colunas que não ordenam — as duas linhas de
// cabeçalho continuam alinhadas na mesma grade.
//
// Alvo (WCAG 2.5.8): o botão tem no mínimo 24px de altura, e o `-my-4` devolve
// ao `th` os 8px a mais, para o cabeçalho não engordar. No toque o `th` ganha
// 4px de padding em cima e embaixo (`pointer-coarse:py-[14px]`) e o `before`
// estende a área de clique até as bordas dele: 16 + 2×14 = 44px (WCAG 2.5.5),
// sem mexer no desenho. Medido antes: 23px; depois do 1º ajuste, 36px.
export const tableSortButtonStyle =
  "group/sort relative -mx-6 -my-4 inline-flex min-h-24 cursor-pointer items-center gap-6 rounded-(--r-xs) px-6 text-left transition-colors hover:text-(--color-text-secondary) focus-ring pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-[14px] pointer-coarse:before:content-['']";

// Coluna ordenada: escurece o rótulo. É o que separa "esta lista está ordenada
// por aqui" de "esta coluna pode ordenar", à distância de um relance.
export const tableSortActiveStyle = "text-(--color-text-secondary)";

// Em repouso a seta dupla fica visível porém apagada: sai do caminho da leitura,
// mas anuncia que a coluna ordena antes de o mouse chegar nela.
export const tableSortIdleIconStyle =
  "text-(--color-text-disabled) transition-colors group-hover/sort:text-current";

export const tableSortActiveIconStyle = "text-(--color-action-text)";
