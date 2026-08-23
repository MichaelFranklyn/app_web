import { cva } from "class-variance-authority";

export const kpiDeltaStyle = cva(
  // `mt-auto`: o texto de apoio é o rodapé do cartão. É ele que absorve a
  // altura sobrando quando um irmão é mais alto — assim os números permanecem
  // na mesma linha.
  "text-[13px] font-medium flex items-center gap-4 mt-auto",
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
