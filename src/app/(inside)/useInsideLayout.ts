"use client";

import { getCookie } from "@/utils/cookies/clientCookie";
import { getTodayIso } from "@/utils/format/date";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LABELS, NAV, ROLE_LABEL, SU_NAV } from "./navConfig";

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

  const pageLabel = isDayRoute
    ? "Rota do dia"
    : (LABELS[pathname] ??
      LABELS[
        Object.keys(LABELS)
          .filter((href) => pathname.startsWith(`${href}/`))
          .sort((a, b) => b.length - a.length)[0]
      ] ??
      "Dashboard");

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

  // SU enxerga os itens de plataforma; os demais roles, só o NAV padrão.
  // Vendedor não vê itens admin-only (/users, /sellers) — as rotas também
  // são protegidas server-side (requireAdminPage), aqui é só a UI do menu.
  const baseNav =
    userData?.role === "SELLER"
      ? NAV.filter((item) => !("adminOnly" in item && item.adminOnly))
      : NAV;
  const navItems = userData?.role === "SU" ? [...baseNav, ...SU_NAV] : baseNav;
  const userInitials = userData ? getUserInitials(userData.userName) : "—";
  const userName = userData?.userName ?? "Usuário";
  const userRole = userData?.role
    ? (ROLE_LABEL[userData.role] ?? userData.role)
    : "—";

  return {
    pathname,
    isDayRoute,
    pageLabel,
    todayIso,
    drawerOpen,
    setDrawerOpen,
    isCollapsed,
    toggleCollapsed,
    navItems,
    userName,
    userRole,
    userInitials,
  };
}
