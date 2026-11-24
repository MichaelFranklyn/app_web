// Respiro lateral maior que o vertical: a linha ganha densidade sem as colunas
// se encostarem. `py-12` no lugar dos 16px de antes tira ~8px de altura por
// linha — numa página de 10, quase uma linha inteira a mais na tela.
// `whitespace-nowrap`: o dado ocupa uma linha só. Quando a soma das colunas não
// cabe, quem cede é a largura da tabela — o wrapper do `Table.Table` rola na
// horizontal — e não o nome do cliente, que virava duas ou três linhas e
// desalinhava a leitura vertical da lista. Uma célula que precise mesmo quebrar
// (texto livre) pede `whitespace-normal` na própria `Table.Cell`.
//
// NO DESKTOP a regra tem uma exceção: o texto LONGO quebra (`tableWrapStyle`,
// em `../utils`), para a tabela caber na tela sem rolar para o lado. Rolar com
// o dedo é natural; com o mouse, obriga a ir até a barra lá embaixo.
//
// `desktop:px-12`: entre 1024 e 1599px (notebook) o respiro lateral encolhe 4px
// de cada lado. Numa tabela de oito colunas são 64px devolvidos ao dado — a
// diferença entre a lista de pedidos caber ou rolar em 1280px. Em tela grande
// volta ao normal.
// Link de texto na célula (o nº do pedido, o nome do cliente): sozinho tinha
// 18px de altura, abaixo do alvo mínimo de 24px (WCAG 2.5.8). O `py-3 -my-3`
// cresce a área de clique sem crescer a linha. Mira só o `TextLink`
// (`data-text-link`): um `Button.Link` na célula já tem o tamanho dele.
const tableCellLinkTarget =
  "[&_a[data-text-link]]:inline-block [&_a[data-text-link]]:py-3 [&_a[data-text-link]]:-my-3";

export const tableCellBase = `px-16 desktop:px-12 desktop-xl:px-16 py-12 align-middle whitespace-nowrap border-b border-(--border) group-last:border-b-0 ${tableCellLinkTarget}`;

export const tableCellFlex = "flex items-center gap-8";

// Números alinhados à direita: a vírgula cai na mesma coluna em toda a lista,
// e comparar valores vira leitura vertical em vez de conferência dígito a
// dígito. `tabular-nums` trava a largura do algarismo para o alinhamento não
// depender do dígito que calhou de aparecer.
export const tableCellAlignStyle = {
  left: "text-left",
  center: "text-center",
  right: "text-right tabular-nums",
} as const;

export const tableCellVariants = {
  default: "text-(--color-text-secondary)",
  strong: "text-(--color-text) font-medium",
  mono: "font-body text-(--color-text-secondary)",
  dim: "text-(--color-text-muted) text-body-sm",
  dim2: "text-(--color-text-muted) text-body-sm",
  // Linha-título de um grupo (a tabela de preço sobre os seus itens).
  group: "bg-(--bg3) text-(--color-text-secondary)",
  // Aviso de atraso dentro da célula ("vencida há 12 dias").
  danger: "text-(--color-status-danger) text-body-sm",
  // Herda o visual da célula: um pedaço de texto que só aparece no cartão do
  // celular (`desktop:hidden`) sem trocar cor nem peso de quem o envolve.
  inherit: "",
} as const;
