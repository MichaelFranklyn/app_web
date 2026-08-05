import { TableHeadAlign } from "./interface";

// Rótulo, não dado: menor e mais espaçado que o corpo, para a linha de títulos
// não competir com o conteúdo. `--muted` (e não `--muted2`) porque o cabeçalho
// agora é clicável — precisa de contraste que convide ao clique.
export const tableHeadStyle =
  "px-16 py-10 text-[12px] font-medium text-(--muted) tracking-[0.06em] uppercase border-b border-(--border) bg-(--bg2) whitespace-nowrap";

export const tableHeadAlignStyle: Record<TableHeadAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Herda a tipografia do `th`. O par `-mx-6 px-6` alarga a área de clique sem
// deslocar o texto em relação às colunas que não ordenam — as duas linhas de
// cabeçalho continuam alinhadas na mesma grade.
export const tableSortButtonStyle =
  "group/sort -mx-6 -my-2 inline-flex cursor-pointer items-center gap-6 rounded-(--r-xs) px-6 py-2 tracking-[inherit] uppercase transition-colors hover:text-(--text2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--amber)";

// Coluna ordenada: escurece o rótulo. É o que separa "esta lista está ordenada
// por aqui" de "esta coluna pode ordenar", à distância de um relance.
export const tableSortActiveStyle = "text-(--text2)";

// Em repouso a seta dupla fica visível porém apagada: sai do caminho da leitura,
// mas anuncia que a coluna ordena antes de o mouse chegar nela.
export const tableSortIdleIconStyle =
  "opacity-40 transition-opacity group-hover/sort:opacity-100";

export const tableSortActiveIconStyle = "text-(--amber) opacity-100";
