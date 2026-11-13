import { cva } from "class-variance-authority";
import { EVENT_CHIP_STYLE } from "@/components/EventChip/style";
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
      /** O que está incluído / deu certo: fundo e borda verdes. */
      success: "border-(--green-bd) bg-(--green-bg)",
      transparent: "bg-transparent",
      /** Pede uma decisão (convite pendente): borda âmbar sobre a caixa interna. */
      highlight: "border-(--amber) bg-(--bg3)",
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
    /** Cartão que flutua sozinho na página (login, cadastro): sombra média. */
    elevated: {
      true: "shadow-(--shadow-md)",
    },
    /**
     * Cartão inteiro dentro de um `<Link className="group">`: sobe e ganha
     * sombra no hover e no foco do link (o atalho de catálogo).
     */
    lift: {
      true: "transition-all duration-200 group-hover:-translate-y-[2px] group-hover:border-(--border2) group-hover:shadow-(--shadow-md) group-focus-visible:border-(--amber) group-focus-visible:shadow-(--shadow-md)",
    },
    /** Clicável: realce âmbar na borda ao passar o mouse. */
    interactive: {
      true: "cursor-pointer transition-colors hover:border-(--amber) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)",
    },
    /**
     * Compromisso da agenda: a borda esquerda na cor do tipo, igual ao
     * `EventChip` (visita âmbar, ligação azul). Por último para vencer o fundo
     * do `tone`.
     */
    event: EVENT_CHIP_STYLE,
    /** Feito ou fora de foco: fica, mas recua. */
    faded: {
      true: "opacity-80",
    },
  },
});
