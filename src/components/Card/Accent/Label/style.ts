import { cva } from "class-variance-authority";

export const accentLabelStyle = cva(
  "text-[13px] tracking-[0.08em] uppercase mb-1 font-medium",
  {
    variants: {
      color: {
        amber: "text-(--amber)",
        red: "text-(--red)",
        green: "text-(--green)",
        blue: "text-(--blue)",
        cyan: "text-(--cyan)",
      },
    },
  }
);
