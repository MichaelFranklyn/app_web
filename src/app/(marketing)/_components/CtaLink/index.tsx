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
 * ver recursos).
 */
export function CtaLink({
  href,
  emphasis = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  emphasis?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-(--radius-sm) transition",
        size === "lg" && "px-32 py-16",
        size === "md" && "px-24 py-12",
        size === "sm" && "px-16 py-8",
        emphasis === "primary"
          ? "bg-(--amber) hover:bg-(--amber2)"
          : "border border-(--border2) bg-(--bg2) hover:bg-(--bg3)",
        className
      )}
    >
      <Title
        variant="body-sm"
        weight="semibold"
        className={emphasis === "primary" ? "text-(--bg2)" : undefined}
      >
        {children}
      </Title>
    </Link>
  );
}
