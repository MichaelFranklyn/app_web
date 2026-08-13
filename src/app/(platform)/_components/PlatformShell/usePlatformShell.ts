"use client";

import { isSuRole } from "@/utils/auth/roles";
import { getCookie } from "@/utils/cookies/clientCookie";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PLATFORM_NAV } from "../../navConfig";

interface UserData {
  userName: string;
  role: string;
}

const getUserInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/**
 * Estado da casca do console: identidade de quem está logado, drawer no mobile
 * e qual item do menu está ativo.
 *
 * Bem mais magro que o `useInsideLayout`: nem rota-do-dia, nem preferência de
 * recolhimento — o console é uma ferramenta de trabalho focada, e a sidebar
 * fica sempre aberta no desktop.
 *
 * O único filtro de menu é o `suOnly`, que hoje esconde uma seção só (Equipe)
 * de quem é suporte. Esconder aqui é cosmética — o gate real é o
 * `requireSuPage` da página e o `@is_super_user` do backend —, mas mostrar uma
 * porta que não abre é pior que não mostrá-la.
 */
export function usePlatformShell() {
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setUserData(getCookie<UserData>("userData"));
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (href: string, matchPrefix?: string) => {
    // "Visão geral" aponta para a raiz do console; sem o caso exato ela ficaria
    // acesa em todas as subpáginas, já que toda rota começa com `/platform`.
    if (href === "/platform") return pathname === "/platform";
    const base = matchPrefix ?? href;
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  // Enquanto o cookie não chegou (primeiro render), o papel é desconhecido e os
  // itens `suOnly` ficam FORA: esconder e aparecer é melhor que piscar um item
  // que o suporte não pode abrir.
  const isSu = isSuRole(userData?.role);
  const navItems = useMemo(
    () =>
      PLATFORM_NAV.filter((item) => !("suOnly" in item && item.suOnly) || isSu),
    [isSu]
  );

  return {
    navItems,
    drawerOpen,
    setDrawerOpen,
    isActive,
    isSu,
    userName: userData?.userName ?? "Equipe da plataforma",
    userInitials: userData ? getUserInitials(userData.userName) : "PL",
  };
}
