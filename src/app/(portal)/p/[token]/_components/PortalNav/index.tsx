"use client";

import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PortalNavProps {
  token: string;
}

/**
 * Duas abas, e só. A tentação de crescer aqui é grande — cada dado novo pede
 * uma —, mas quem abre esta página está numa loja, no meio do expediente, e
 * tem duas perguntas: o que eu comprei, e o que está acabando.
 *
 * Cliente por causa do `usePathname`: o layout é server e não recebe a rota,
 * e derivar a aba ativa aqui é mais barato que repetir o cabeçalho inteiro em
 * cada página só para saber qual delas está aberta.
 */
export function PortalNav({ token }: PortalNavProps) {
  const pathname = usePathname();
  const isStock = pathname?.endsWith("/estoque") ?? false;

  const tabs = [
    { label: "Minhas compras", href: `/p/${token}`, isActive: !isStock },
    { label: "Meu estoque", href: `/p/${token}/estoque`, isActive: isStock },
  ];

  return (
    <nav className="border-b border-(--border) px-[16px]">
      <div className="mx-auto flex w-full max-w-[1120px] gap-[8px]">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.isActive ? "page" : undefined}
            className={cn(
              "border-b-2 px-[8px] py-[12px]",
              tab.isActive
                ? "border-(--amber) text-(--text)"
                : "border-transparent text-(--muted) hover:text-(--text2)"
            )}
          >
            <Title
              variant="body-sm"
              weight={tab.isActive ? "semibold" : "regular"}
            >
              {tab.label}
            </Title>
          </Link>
        ))}
      </div>
    </nav>
  );
}
