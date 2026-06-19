import { CardAccentColor } from "../../interface";
import { accentBorderVariants } from "../../style";

export const accentRootStyle =
  "bg-(--bg2) border border-(--border) rounded-(--r-lg) overflow-hidden px-16 py-[14px]";

export const accentBorderStyle: Record<CardAccentColor, string> = accentBorderVariants;
