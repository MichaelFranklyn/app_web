"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  basePath: string;
  children: ReactNode;
}

/**
 * Esconde o "chrome" da fábrica (cabeçalho + navegação) nas páginas de detalhe
 * (produto e tabela de preço), onde o cabeçalho do próprio recurso assume o
 * topo. Nas demais rotas, renderiza normalmente.
 */
export function FactoryChrome({ basePath, children }: Props) {
  const pathname = usePathname();
  const sub = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : "";
  const segments = sub.split("/").filter(Boolean);
  const isDetailPage =
    (segments[0] === "products" || segments[0] === "price-lists") &&
    segments.length >= 2;

  if (isDetailPage) return null;
  return <>{children}</>;
}
