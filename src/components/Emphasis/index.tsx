import { cn } from "@/lib/utils";
import React from "react";

interface EmphasisProps extends React.HTMLAttributes<HTMLElement> {
  /** `strong`: cor do texto principal, para destacar dentro de texto apagado. */
  tone?: "inherit" | "strong";
}

/**
 * Destaque dentro de uma frase ("**não salve nada** até o sinal voltar").
 * Herda tamanho e cor do texto em volta — funciona igual num tooltip, numa
 * faixa colorida ou num parágrafo apagado.
 */
export const Emphasis = ({
  tone = "inherit",
  className,
  ...props
}: EmphasisProps) => (
  <strong
    className={cn(
      "font-(--weight-bold)",
      tone === "strong" && "text-(--text)",
      className
    )}
    {...props}
  />
);
