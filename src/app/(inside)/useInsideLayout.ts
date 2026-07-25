"use client";

import { isOwnerRole } from "@/utils/auth/roles";
import { getCookie } from "@/utils/cookies/clientCookie";
import { getTodayIso } from "@/utils/format/date";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROLE_LABEL, SU_NAV, visibleNav } from "./navConfig";

interface UserData {
  userId: string;
  userName: string;
  companyName: string;
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
 * Cérebro do InsideLayout: agrupa os 4 concerns que antes viviam soltos no
 * `layout.tsx` — dados/derivados do usuário, rótulo da página, estado do drawer
 * (mobile) e do collapse da sidebar (desktop, persistido). O `layout.tsx` fica
 * só com o render.
 */
export function useInsideLayout() {
  const pathname = usePathname();

  // Rota de um dia específico (/routines/<data>), distinta da grade semanal.
  const isDayRoute = /^\/routines\/[^/]+/.test(pathname);

  const [userData, setUserData] = useState<UserData | null>(null);
  // Data de hoje resolvida só no cliente (evita mismatch de hidratação).
  const [todayIso, setTodayIso] = useState<string | null>(null);
  // Drawer do menu lateral no mobile/tablet (no desktop a sidebar é fixa).
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Sidebar recolhida (só ícones) — comportamento exclusivo do desktop,
  // persistido em localStorage para sobreviver à navegação.
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = getCookie<UserData>("userData");
    setUserData(storedUser);
    setTodayIso(getTodayIso());
    setIsCollapsed(localStorage.getItem("sidebarCollapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
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
  const baseNav = visibleNav(userData?.role);
  const navItems = userData?.role === "SU" ? [...baseNav, ...SU_NAV] : baseNav;
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
