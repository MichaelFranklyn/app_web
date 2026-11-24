export const breadcrumbItemStyles = {
  // `inline-block py-2`: o link tinha 21px de altura, abaixo do mínimo de 24px
  // de alvo (WCAG 2.5.8). Com 2px em cima e embaixo, 25px — sem mudar o
  // desenho da linha.
  // No toque, a área cresce por um ::after invisível (o mesmo truque da
  // Pagination): 25px de link viram ~45px de alvo sem mexer na linha.
  base: "relative inline-block rounded-(--r-xs) py-2 text-(--color-text-muted) transition-colors focus-ring pointer-coarse:after:absolute pointer-coarse:after:-inset-x-[4px] pointer-coarse:after:-inset-y-[10px] pointer-coarse:after:content-['']",
  interactive:
    "cursor-pointer underline-offset-2 hover:text-(--color-text) hover:underline",
  // Sem `pointer-events-none`: o item atual é um <span>, não há clique a
  // bloquear — e ele bloqueava a dica (`title`) do item cortado.
  active: "text-(--color-text-secondary) font-medium cursor-default",
};
