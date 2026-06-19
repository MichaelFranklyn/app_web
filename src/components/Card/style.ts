import { CardAccentColor, CardBg } from "./interface";

export const cardBaseStyle =
  "bg-(--bg2) border border-(--border) rounded-(--r-lg) overflow-hidden flex flex-col relative w-full h-full";

export const accentBorderVariants: Record<CardAccentColor, string> = {
  amber: "border-l-[3px] border-l-(--amber)",
  red: "border-l-[3px] border-l-(--red)",
  green: "border-l-[3px] border-l-(--green)",
  blue: "border-l-[3px] border-l-(--blue)",
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
  "px-16 py-12 border-b border-(--border) flex items-center justify-between gap-3 min-h-[48px]";

export const cardFooterBaseStyle =
  "px-16 py-[10px] border-t border-(--border) flex items-center justify-between text-[12px] text-(--muted) min-h-[38px]";
