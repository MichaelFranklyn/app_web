import { CardAccentColor, CardBg } from "./interface";

/**
 * A sombra é fixa do card e quem a tira é o LUGAR, não a variante (18/11/2026,
 * como no `Alert`): dentro de outro card (`data-slot=card`) ou de modal/painel
 * (`role=dialog`) ela some para não empilhar. Antes `inset` e `muted` tiravam
 * a sombra supondo "sempre dentro de card" — e a caixa solta na página
 * (a divisão do mês em /commissions) ficava chapada, diferente dos vizinhos.
 */
export const cardBaseStyle =
  "bg-(--bg2) border border-(--border) rounded-(--r-lg) shadow-(--shadow-card) in-data-[slot=card]:shadow-none in-[[role=dialog]]:shadow-none overflow-hidden flex flex-col relative w-full h-full";

export const accentBorderVariants: Record<CardAccentColor, string> = {
  amber: "border-l-[3px] border-l-(--amber)",
  red: "border-l-[3px] border-l-(--color-status-danger)",
  green: "border-l-[3px] border-l-(--color-status-success)",
  blue: "border-l-[3px] border-l-(--color-status-info)",
  cyan: "border-l-[3px] border-l-(--cyan)",
};

export const bgVariants: Record<CardBg, string> = {
  bg: "bg-(--bg)",
  bg2: "bg-(--bg2)",
  bg3: "bg-(--bg3)",
  bg4: "bg-(--bg4)",
  bg5: "bg-(--bg5)",
};

export const actionsStyle = "flex shrink-0 items-center gap-[6px]";

export const cardHeadStyle =
  "px-20 py-12 border-b border-(--border) flex flex-wrap items-center justify-between gap-3 min-h-[52px]";

export const cardFooterBaseStyle =
  "px-16 py-[10px] border-t border-(--border) flex items-center justify-between text-body-sm text-(--color-text-muted) min-h-[38px]";
