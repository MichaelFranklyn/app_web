import { cva } from "class-variance-authority";

export type CardItemValueColor = "amber" | "green" | "red";

export const valueStyle = cva("font-bold text-(--text) font-head", {
  variants: {
    color: {
      amber: "text-(--amber)",
      green: "text-(--green)",
      red: "text-(--red)",
    },
  },
});
