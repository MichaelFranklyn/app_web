import { cva } from "class-variance-authority";

export const itemVariants = cva(
  // `mx-4`: o destaque é uma pílula dentro do menu, não uma faixa colada nas
  // bordas (o raio de 7px ficava cortado pela borda do painel).
  // `active:` dá o retorno do toque/clique antes de o menu fechar.
  "relative mx-4 flex min-h-[36px] cursor-pointer select-none items-center gap-8 rounded-(--r-sm) px-10 py-8 text-[14px] text-(--color-text-secondary) outline-none transition-colors focus:bg-(--bg3) focus:text-(--color-text) active:bg-(--bg4) data-[disabled]:pointer-events-none data-[disabled]:text-(--color-text-disabled)",
  {
    variants: {
      danger: {
        true: "text-(--color-status-danger) focus:bg-(--color-status-danger-bg) focus:text-(--color-status-danger) active:bg-(--color-status-danger-bg)",
      },
    },
  }
);
