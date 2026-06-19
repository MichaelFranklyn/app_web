import { cva } from "class-variance-authority";

export const titleStyle = cva(
  "font-head truncate tracking-[-0.01em] text-(--text)",
  {
    variants: {
      size: {
        xs: "text-[11px]",
        sm: "text-[15px]",
        md: "text-[19px]",
        lg: "text-[23px]",
      },
      weight: {
        medium: "font-medium",
        semibold: "font-(--weight-semibold)",
        bold: "font-(--weight-bold)",
        extrabold: "font-extrabold",
      },
    },
    defaultVariants: { size: "sm", weight: "bold" },
  }
);
