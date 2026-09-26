export const alertRootStyles = {
  root: "rounded-(--r-md) flex items-start border",

  sizes: {
    md: "p-12 px-16 gap-10",
    /** Dentro de um card de lista, onde o aviso divide espaço com a linha. */
    sm: "p-8 gap-8",
  },

  variants: {
    info: "bg-(--blue-bg)  border-(--blue-bd)  text-(--blue)",
    success: "bg-(--green-bg) border-(--green-bd) text-(--green)",
    warning: "bg-(--amber-bg) border-(--amber-bd) text-(--amber)",
    error: "bg-(--red-bg)   border-(--red-bd)   text-(--red)",
    neutral: "bg-(--bg2)      border-(--border)   text-(--text)",
  },
};
