"use client";

import { ClipboardList, Package, Send, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PORTAL_HOME_TITLE } from "../../utils";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Só acende na rota exata (a raiz do portal é prefixo de todas). */
  exact?: boolean;
}

/**
 * Itens do menu do portal. "Pedidos" (compras e orçamentos num lugar só) vale para todo cliente —
 * a home não lista mais pedidos, então é ali que ele os encontra. Só "Fazer pedido" depende do
 * plano permitir pedir pelo portal.
 */
export function portalNavItems(
  token: string,
  canOrder: boolean
): PortalNavItem[] {
  const base = `/p/${token}`;
  return [
    { href: base, label: PORTAL_HOME_TITLE, icon: ClipboardList, exact: true },
    { href: `${base}/enviados`, label: "Pedidos", icon: Send },
    { href: `${base}/estoque`, label: "Meu estoque", icon: Package },
    ...(canOrder
      ? [{ href: `${base}/pedido`, label: "Fazer pedido", icon: ShoppingCart }]
      : []),
  ];
}

/** O item ativo: rota exata para a raiz, prefixo para as demais. */
export function activePortalItem(
  items: PortalNavItem[],
  pathname: string
): PortalNavItem | null {
  return (
    items.find((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? null
  );
}

/**
 * Estado da casca do portal: drawer no celular, menu recolhido no computador
 * e qual item está aceso.
 *
 * Mais magro ainda que o do console: não há sessão, cookie nem papel — quem
 * está do outro lado é o cliente do link, e o perfil chega pronto do servidor.
 */
export function usePortalShell(token: string, canOrder: boolean) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Começa ABERTA, ao contrário do sistema: o cliente entra poucas vezes e
  // precisa ler os nomes do menu; o ícone sozinho não diz nada a ele.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const navItems = portalNavItems(token, canOrder);
  const active = activePortalItem(navItems, pathname);

  return {
    navItems,
    active,
    drawerOpen,
    setDrawerOpen,
    collapsed,
    toggleCollapsed: () => setCollapsed((value) => !value),
  };
}
