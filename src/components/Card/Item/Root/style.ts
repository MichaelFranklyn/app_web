import { cva } from "class-variance-authority";

export const itemStyle = cva("flex items-center", {
  variants: {
    variant: {
      list: "gap-3",
      // `flex-wrap` + `gap-x-12`: a linha do stat é rótulo de um lado e valor
      // (às vezes com um botão junto) do outro. Em 320px, "Comissão" mais
      // "Aplicar aos pedidos faturados" não cabem lado a lado, e o card, que é
      // overflow-hidden, cortava o botão. Quebrando, o valor desce inteiro.
      stat: "flex-wrap justify-between gap-x-12 text-[13px]",
    },
    size: {
      default: "py-[10px]",
      compact: "py-[6px]",
    },
  },
  defaultVariants: { variant: "list", size: "default" },
});
