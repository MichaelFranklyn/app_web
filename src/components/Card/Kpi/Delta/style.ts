import { cva } from "class-variance-authority";

export const kpiDeltaStyle = cva(
  // `mt-auto`: o texto de apoio é o rodapé do cartão. É ele que absorve a
  // altura sobrando quando um irmão é mais alto — assim os números permanecem
  // na mesma linha.
  // `anywhere`: em 2 colunas no celular o cartão tem ~120px úteis, e um
  // "faturamento/pagamento" (palavra única) estourava o cartão.
  // O fio de cima separa o número (o que é) do apoio (de onde vem): sem ele o
  // texto de apoio colava no número e parecia parte do valor.
  "text-body-sm font-medium leading-snug flex items-center gap-4 mt-auto pt-12 border-t border-(--border) min-w-0 [overflow-wrap:anywhere]",
  {
    variants: {
      positive: { true: "text-(--color-status-success)", false: "" },
      negative: { true: "text-(--color-status-danger)", false: "" },
    },
    compoundVariants: [
      {
        positive: false,
        negative: false,
        className: "text-(--color-text-muted)",
      },
    ],
    defaultVariants: { positive: false, negative: false },
  }
);
