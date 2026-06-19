import { cva } from "class-variance-authority";

export const itemVariants = cva(
  "w-[28px] h-[28px] rounded-(--r-sm) flex items-center justify-center font-head font-medium text-[12px] text-(--muted) cursor-pointer border border-transparent transition-all duration-120 hover:text-(--text) hover:bg-(--bg3) hover:border-(--border) disabled:opacity-30 disabled:cursor-default disabled:pointer-events-none disabled:bg-transparent disabled:border-transparent disabled:text-(--muted)",
  {
    variants: {
      active: {
        true: "text-(--amber) bg-(--amber-bg) border-(--amber-bd) hover:text-(--amber) hover:bg-(--amber-bg) hover:border-(--amber-bd)",
      },
    },
  }
);
