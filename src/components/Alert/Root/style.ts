export const alertRootStyles = {
  // Sem faixa lateral (14/11/2026): a barra colorida à esquerda é o clichê de
  // "componente gerado" e o usuário recusou. Quem classifica o aviso antes da
  // leitura é o ícone no círculo tingido (Alert.Icon) sobre o fundo do tom,
  // com a borda fina e inteira na mesma família de cor.
  root: "rounded-(--r-lg) flex items-start border",

  sizes: {
    md: "p-12 px-16 gap-10",
    /** Dentro de um card de lista, onde o aviso divide espaço com a linha. */
    sm: "p-8 gap-8 [&_[data-slot=alert-icon]]:size-[24px]",
  },

  variants: {
    info: "bg-(--color-status-info-bg) border-(--color-status-info-bd) text-(--color-status-info)",
    success:
      "bg-(--color-status-success-bg) border-(--color-status-success-bd) text-(--color-status-success)",
    // Alerta usa a cor de alerta, não o âmbar: o âmbar é só do que se clica.
    warning:
      "bg-(--color-status-warning-bg) border-(--color-status-warning-bd) text-(--color-status-warning)",
    error:
      "bg-(--color-status-danger-bg) border-(--color-status-danger-bd) text-(--color-status-danger)",
    neutral: "bg-(--bg2) border-(--border) text-(--color-text)",
  },
};
