import { cva } from "class-variance-authority";

// No toque, o `after` invisível estica o alvo a 44px de altura e cobre metade
// do gap de 4px de cada lado (32×44; o inset conta da caixa de padding,
// 26px por dentro da borda): alvo maior sem invadir o vizinho e sem
// mudar o desenho de 28px, que precisa caber 7 itens em 360px.
export const itemVariants = cva(
  "relative pointer-coarse:after:absolute pointer-coarse:after:-inset-x-[3px] pointer-coarse:after:-inset-y-[9px] pointer-coarse:after:content-[''] w-[28px] h-[28px] rounded-(--r-sm) flex items-center justify-center font-head font-medium text-body-sm text-(--color-text-muted) cursor-pointer border border-transparent transition-colors duration-150 hover:text-(--color-text) hover:bg-(--bg3) disabled:text-(--color-text-disabled) disabled:cursor-default disabled:pointer-events-none disabled:bg-transparent disabled:border-transparent",
  {
    variants: {
      active: {
        // Página atual cheia de âmbar: é onde a pessoa ESTÁ, e o olho acha na hora.
        true: "text-(--color-on-action) bg-(--color-action) border-(--color-action) font-semibold hover:text-(--color-on-action) hover:bg-(--color-action)",
      },
    },
  }
);
