import { cn } from "@/lib/utils";
import React from "react";

interface EmphasisProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * `strong`: cor do texto principal, para destacar dentro de texto apagado.
   * `accent`: só a cor âmbar, herdando o peso — a palavra em destaque de um
   * título ("Pendências **do dia**") ou o aviso dentro de uma linha cinza.
   * `promo`: o laranja da promoção relâmpago, herdando o peso — a janela da
   * promoção dentro da linha de vigência.
   */
  tone?: "inherit" | "strong" | "accent" | "promo";
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
      tone === "accent" || tone === "promo"
        ? "font-[inherit]"
        : "font-(--weight-bold)",
      tone === "accent" && "text-(--amber)",
      tone === "promo" && "text-(--orange)",
      tone === "strong" && "text-(--text)",
      className
    )}
    {...props}
  />
);
