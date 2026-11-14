import { cva } from "class-variance-authority";

export type CardItemValueColor = "warning" | "green" | "red";

export const valueStyle = cva("font-bold text-(--color-text) font-head", {
  variants: {
    color: {
      warning: "text-(--color-status-warning)",
      green: "text-(--color-status-success)",
      red: "text-(--color-status-danger)",
    },
  },
});
