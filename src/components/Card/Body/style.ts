import { cva } from "class-variance-authority";

export const bodyStyle = cva("relative flex flex-1 flex-col", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-12",
      compact: "p-16",
      default: "p-24 gap-12",
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
});
