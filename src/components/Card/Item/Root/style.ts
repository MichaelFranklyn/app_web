import { cva } from "class-variance-authority";

export const itemStyle = cva("flex items-center", {
  variants: {
    variant: {
      list: "gap-3",
      stat: "justify-between text-[13px]",
    },
    size: {
      default: "py-[10px]",
      compact: "py-[6px]",
    },
  },
  defaultVariants: { variant: "list", size: "default" },
});

