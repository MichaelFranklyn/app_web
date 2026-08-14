"use client";

import { usePlan } from "@/services/plan";
import { isOwnerRole } from "@/utils/auth/roles";
import { getCookie } from "@/utils/cookies/clientCookie";
import { getTodayIso } from "@/utils/format/date";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROLE_LABEL, visibleNav } from "./navConfig";

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
  // persistido em localStorage para sobreviver à navegação. Começa `false` no
  // primeiro render para casar com o servidor; o padrão real (recolhida) entra
  // no efeito, junto com a preferência salva.
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = getCookie<UserData>("userData");
    setUserData(storedUser);
    setTodayIso(getTodayIso());
    // Padrão recolhido: quem nunca mexeu entra com o menu fechado, e a tela
    // inteira fica para o conteúdo. Só a escolha explícita de expandir ("0")
    // sobrevive — sem valor salvo, recolhe.
    setIsCollapsed(localStorage.getItem("sidebarCollapsed") !== "0");
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
