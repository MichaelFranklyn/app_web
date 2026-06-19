import { cva } from "class-variance-authority";

export const kpiDeltaStyle = cva(
  "text-[13px] font-medium flex items-center gap-4",
  {
    variants: {
      positive: { true: "text-(--green)", false: "" },
      negative: { true: "text-(--red)", false: "" },
    },
    compoundVariants: [
      { positive: false, negative: false, className: "text-(--muted)" },
    ],
    defaultVariants: { positive: false, negative: false },
  }
);
