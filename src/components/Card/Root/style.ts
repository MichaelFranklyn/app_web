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
      muted: "bg-(--bg3) shadow-none",
      /** O que está incluído / deu certo: fundo e borda verdes. */
      success:
        "border-(--color-status-success-bd) bg-(--color-status-success-bg)",
      transparent: "bg-transparent shadow-none",
    },
    /**
     * Caixa interna — um bloco dentro de modal/card, não um card de página:
     * raio menor e altura do conteúdo (o card de página estica na grade).
     */
    inset: {
      true: "h-auto rounded-(--r-md) shadow-none",
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
      true: "transition-[translate,box-shadow,border-color] duration-200 ease-(--ease-out-soft) motion-reduce:group-hover:translate-none group-hover:-translate-y-[2px] group-hover:border-(--border2) group-hover:shadow-(--shadow-md) group-focus-visible:border-(--amber) group-focus-visible:shadow-(--shadow-md)",
    },
    /** Clicável: realce âmbar na borda e uma sombra curta ao passar o mouse. */
    interactive: {
      true: "cursor-pointer transition-[border-color,box-shadow] duration-150 hover:border-(--amber) hover:shadow-(--shadow-sm) focus-ring",
    },
    /**
     * Compromisso da agenda: a borda esquerda na cor do tipo, igual ao
     * `EventChip` (visita âmbar, ligação azul). Por último para vencer o fundo
     * do `tone`.
     */
    event: EVENT_CHIP_STYLE,
    /**
     * Feito ou fora de foco: fica, mas recua. Recua pelo FUNDO (o cinza da
     * página, sem sombra), não por `opacity` — esmaecer o card inteiro apagava
     * junto o texto e os selos de status. O texto apagado é de quem renderiza
     * (`Title color="muted"`). Depois do `event` para vencer o `--bg2` dele.
     */
    faded: {
      true: "bg-(--bg) shadow-none",
    },
  },
});
