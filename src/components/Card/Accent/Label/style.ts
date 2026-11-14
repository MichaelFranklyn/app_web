import { cva } from "class-variance-authority";

export const accentLabelStyle = cva("text-body-sm mb-1 font-medium", {
  variants: {
    color: {
      amber: "text-(--color-action-text)",
      red: "text-(--color-status-danger)",
      green: "text-(--color-status-success)",
      blue: "text-(--color-status-info)",
      cyan: "text-(--cyan-text)",
    },
  },
});
