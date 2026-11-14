export const breadcrumbItemStyles = {
  // `inline-block py-2`: o link tinha 21px de altura, abaixo do mínimo de 24px
  // de alvo (WCAG 2.5.8). Com 2px em cima e embaixo, 25px — sem mudar o
  // desenho da linha.
  base: "inline-block rounded-(--r-xs) py-2 text-(--color-text-muted) transition-colors focus-ring",
  interactive:
    "cursor-pointer underline-offset-2 hover:text-(--color-text) hover:underline",
  active: "text-(--color-text-secondary) font-medium pointer-events-none",
};
