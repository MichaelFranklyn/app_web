"use client";

import { UserData } from "@/app/(auth)/login/interface";
import { usePlan } from "@/services/plan";
import { isOwnerRole } from "@/utils/auth/roles";
import { setCookie } from "@/utils/cookies/clientCookie";
import { getTodayIso } from "@/utils/format/date";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROLE_LABEL, SIDEBAR_COLLAPSED_COOKIE, visibleNav } from "./navConfig";

interface UseInsideLayoutParams {
  /** Quem está logado, lido do cookie NO SERVIDOR (ver `layout.tsx`). */
  userData: UserData | null;
  /** Preferência de sidebar recolhida, também vinda do servidor. */
  initialCollapsed: boolean;
}

const getUserInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/**
 * Cérebro do InsideLayout: agrupa os 4 concerns que antes viviam soltos no
 * `layout.tsx` — dados/derivados do usuário, rótulo da página, estado do drawer
 * (mobile) e do collapse da sidebar (desktop, persistido). O `layout.tsx` fica
 * só com o render.
 *
 * Quem está logado e se a sidebar está recolhida chegam PRONTOS do servidor, e
 * não de um efeito pós-mount. Era daí que vinha o tranco visível em toda tela
 * de dentro: o primeiro render saía sem papel (menu curto) e com a sidebar
 * larga (232px), e um instante depois o efeito trocava as duas coisas — o menu
 * ganhava itens e o conteúdo escorregava 160px para a esquerda. O Speed
 * Insights conta isso como CLS em cada visita, em todas as rotas de dentro.
 */
export function useInsideLayout({
  userData,
  initialCollapsed,
}: UseInsideLayoutParams) {
  const pathname = usePathname();

  // Rota de um dia específico (/routines/<data>), distinta da grade semanal.
  const isDayRoute = /^\/routines\/[^/]+/.test(pathname);

  // Data de hoje resolvida só no cliente (evita mismatch de hidratação).
  const [todayIso, setTodayIso] = useState<string | null>(null);
  // Drawer do menu lateral no mobile/tablet (no desktop a sidebar é fixa).
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Sidebar recolhida (só ícones) — comportamento exclusivo do desktop. O valor
  // inicial é o do cookie, então servidor e cliente pintam a MESMA largura.
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    setTodayIso(getTodayIso());
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      // Cookie, e não localStorage: o servidor precisa ler a preferência para
      // renderizar a largura certa de primeira.
      setCookie(SIDEBAR_COLLAPSED_COOKIE, next);
      return next;
    });
  };

  // Fecha o menu ao trocar de página (relevante no mobile).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Cada destino de configuração tem o seu `access`, que espelha o guard da rota:
  // o vendedor não vê Empresa/Pessoas/Catálogos (e a seção inteira desaparece com
  // eles). As rotas seguem protegidas server-side — aqui é só a UI do menu.
  // SU enxerga também os itens de plataforma.
  //
  // O plano corta antes do papel: o que a empresa não contratou não aparece
  // para ninguém. Vem do SSR (ver o layout), então o menu já nasce certo — sem
  // itens que somem depois que a resposta chega.
  const { features } = usePlan();
  const navItems = visibleNav(userData?.role, features);
  const userInitials = userData ? getUserInitials(userData.userName) : "—";
  const userName = userData?.userName ?? "Usuário";
  const userRole = userData?.role
    ? (ROLE_LABEL[userData.role] ?? userData.role)
    : "—";
  // Dono da conta: ganha o atalho "Dados da empresa" no menu do usuário.
  const canManageCompany = isOwnerRole(userData?.role);

  return {
    pathname,
    isDayRoute,
    todayIso,
    drawerOpen,
    setDrawerOpen,
    isCollapsed,
    toggleCollapsed,
    navItems,
    userName,
    userRole,
    userInitials,
    canManageCompany,
  };
}
