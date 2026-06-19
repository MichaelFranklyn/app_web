import { cva } from "class-variance-authority";
import { accentBorderVariants, cardBaseStyle } from "../style";

export const rootStyle = cva(cardBaseStyle, {
  variants: {
    accent: accentBorderVariants,
    isCompact: {
      true: "px-4 py-[14px]",
    },
  },
});
