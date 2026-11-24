import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

/**
 * Porta de entrada da landing — sempre um link, nunca um `Button`.
 *
 * O `Button` do sistema é um `<button>`: serve para agir dentro de uma tela
 * logada, não para navegar. Num site público o CTA precisa ser âncora de
 * verdade — é o que dá "abrir em nova aba", o que o buscador segue e o que o
 * Next pré-carrega ao passar o mouse.
 *
 * `emphasis` traduz a taxonomia de botões do sistema para cá: âmbar é a ação
 * que queremos (criar conta), a versão de contorno é a alternativa (entrar,
 * ver recursos). `inverse` (19/11/2026) é o contorno claro sobre a faixa
 * escura do fechamento.
 */
export function CtaLink({
  href,
  emphasis = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  emphasis?: "primary" | "secondary" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-(--r-sm) transition",
        size === "lg" && "px-32 py-16",
        size === "md" && "px-24 py-12",
        size === "sm" && "px-16 py-8",
        // Tokens de papel, os mesmos do `Button` (14/11/2026): o `--amber` cru
        // dava 3,2:1 com o texto branco (falha AA) e a borda `--border2` é de
        // divisória, não de controle.
        emphasis === "primary"
          ? "bg-(--color-action) shadow-(--shadow-sm) hover:brightness-[0.92]"
          : emphasis === "inverse"
            ? "border border-white/40 hover:bg-white/10"
            : "border border-(--color-border-control) bg-(--bg2) hover:bg-(--bg3)",
        className
      )}
    >
      <Title
        variant="body-sm"
        weight="semibold"
        color={emphasis === "inverse" ? "inverse" : undefined}
        className={
          emphasis === "primary" ? "text-(--color-on-action)" : undefined
        }
      >
        {children}
      </Title>
    </Link>
  );
}
