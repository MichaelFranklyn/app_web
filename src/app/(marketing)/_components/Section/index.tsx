import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Casca de uma seção da landing: largura máxima, respiro vertical e o fundo.
 *
 * Existe para as seções não repetirem `mx-auto max-w-[1200px] px-24 py-64` oito
 * vezes — quando o respiro precisar mudar, muda aqui e a página inteira
 * acompanha, em vez de sobrar uma seção com espaçamento diferente das outras.
 *
 * `tone` alterna o fundo entre o papel da página (`--bg`) e o branco dos
 * cartões (`--bg2`). Alternar é o que separa uma seção da seguinte sem precisar
 * de linha divisória em cada emenda.
 */
export function Section({
  id,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  tone?: "default" | "raised";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      /* `scroll-mt` compensa a altura do header ao chegar por âncora: sem ele o
         título da seção para embaixo da barra do topo. */
      className={cn(
        "scroll-mt-64",
        tone === "raised" ? "bg-(--bg2)" : "bg-(--bg)",
        tone === "raised" && "border-y border-(--border)"
      )}
    >
      <div
        className={cn(
          "tablet:py-64 mx-auto max-w-[1200px] px-24 py-48",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}
