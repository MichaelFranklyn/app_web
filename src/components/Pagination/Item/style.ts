import { cva } from "class-variance-authority";

export const itemVariants = cva(
  "w-[28px] h-[28px] rounded-(--r-sm) flex items-center justify-center font-head font-medium text-body-sm text-(--color-text-muted) cursor-pointer border border-transparent transition-colors duration-150 hover:text-(--color-text) hover:bg-(--bg3) disabled:text-(--color-text-disabled) disabled:cursor-default disabled:pointer-events-none disabled:bg-transparent disabled:border-transparent",
  {
    variants: {
      active: {
        // Página atual cheia de âmbar: é onde a pessoa ESTÁ, e o olho acha na hora.
        true: "text-(--color-on-action) bg-(--color-action) border-(--color-action) font-semibold hover:text-(--color-on-action) hover:bg-(--color-action)",
      },
    },
  }
);
