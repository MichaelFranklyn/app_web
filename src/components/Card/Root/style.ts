import { cva } from "class-variance-authority";
import { accentBorderVariants, cardBaseStyle } from "../style";

export const rootStyle = cva(cardBaseStyle, {
  variants: {
    accent: accentBorderVariants,
    isCompact: {
      true: "px-4 py-[14px]",
    },
    /** Fundo: `muted` (bg3) é a caixa DENTRO de um card, modal ou painel. */
    tone: {
      default: "",
      muted: "bg-(--bg3)",
      transparent: "bg-transparent",
    },
    /**
     * Caixa interna — um bloco dentro de modal/card, não um card de página:
     * raio menor e altura do conteúdo (o card de página estica na grade).
     */
    inset: {
      true: "h-auto rounded-(--r-md)",
    },
    dashed: {
      true: "border-dashed",
    },
    /** Clicável: realce âmbar na borda ao passar o mouse. */
    interactive: {
      true: "cursor-pointer transition-colors hover:border-(--amber) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)",
    },
  },
});
