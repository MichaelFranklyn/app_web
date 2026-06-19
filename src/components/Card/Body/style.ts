import { cva } from "class-variance-authority";

export const bodyStyle = cva("relative flex flex-1 flex-col", {
  variants: {
    padding: {
      none: "p-0",
      compact: "p-16",
      default: "p-24 gap-12",
    },
  },
  defaultVariants: { padding: "default" },
});
