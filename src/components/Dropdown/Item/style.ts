import { cva } from "class-variance-authority";

export const itemVariants = cva(
  "relative flex cursor-pointer select-none items-center gap-[8px] px-[14px] py-[8px] text-[14px] rounded-sm text-(--text2) outline-none transition-colors focus:bg-(--bg3) focus:text-(--text) data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      danger: {
        true: "text-(--red) focus:bg-(--red-bg) focus:text-(--red)",
      },
    },
  }
);
