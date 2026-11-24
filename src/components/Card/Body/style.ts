import { cva } from "class-variance-authority";

/**
 * Padrão dos cards (23/11/2026): o respiro e o espaço entre blocos andam
 * juntos e vêm SÓ daqui — nada de `gap-*`/`flex flex-col` no className.
 *
 *   • default → card da página (formulário, texto, gráfico): p-24, gap-16.
 *   • compact → lista de linhas `Card.Item` e card dentro de modal: p-16, gap-12.
 *   • sm      → card embutido (`Card.Root inset`, card dentro de card): p-12, gap-8.
 *   • none    → o conteúdo cuida da borda (tabela, mapa, imagem).
 *
 * Linhas `Card.Item` se separam pela própria borda: quando são filhas diretas,
 * o gap zera — senão sobrava um vão entre a linha e o divisor.
 */
export const bodyStyle = cva(
  "relative flex flex-1 flex-col has-[>[data-card-item]]:gap-0",
  {
    variants: {
      padding: {
        none: "p-0",
        sm: "p-12 gap-8",
        compact: "p-16 gap-12",
        default: "p-24 gap-16",
      },
      /**
       * `wide`: as linhas (Card.Item) em duas colunas entre o desktop e o
       * desktop-xl — a faixa em que um card de resumo, que no desktop-xl fica
       * numa coluna lateral, ocupa a largura toda da página. Numa coluna só,
       * cada valor ficava a mais de 1000px do rótulo. A última linha de cada
       * coluna perde a borda (o `last:` do Card.Item só pega a da direita).
       */
      columns: {
        single: "",
        wide: "desktop:max-desktop-xl:grid desktop:max-desktop-xl:grid-cols-2 desktop:max-desktop-xl:gap-x-48 desktop:max-desktop-xl:[&>*:nth-last-child(2):nth-child(odd)]:border-b-0",
      },
    },
    defaultVariants: { padding: "default", columns: "single" },
  }
);
