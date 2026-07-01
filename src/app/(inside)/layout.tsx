"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { FlowTourProvider } from "@/services/flowTour";
import { cn } from "@/lib/utils";
import { getCookie } from "@/utils/cookies/clientCookie";
import { getTodayIso } from "@/utils/format/date";
import { NotificationCenter } from "./_components/NotificationCenter";
import { UserMenu } from "./_components/UserMenu";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Route,
  Settings,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  userId: string;
  userName: string;
  companyName: string;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  SU: "Super Admin",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    // href resolvido em runtime para a data de hoje (rota do dia). Atalho para
    // o vendedor abrir direto a rota de hoje, sem passar pela grade semanal.
    todayRoute: true,
    label: "Rota do dia",
    icon: Route,
  },
  { divider: true },
  { section: "Operações" },
  {
    href: "/routines",
    label: "Rotina da Semana",
    icon: CalendarDays,
  },
  {
    href: "/orders",
    label: "Pedidos",
    icon: ClipboardList,
  },
  {
    href: "/clients",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/factories",
    label: "Fábricas",
    icon: Building2,
  },
  { divider: true },
  { section: "Configurações" },
  {
    href: "/users",
    label: "Usuários",
    icon: UserCog,
  },
  {
    href: "/sellers",
    label: "Vendedores",
    icon: UserCheck,
  },
  {
    href: "/settings",
    label: "Configurações",
    icon: Settings,
  },
];

const LABELS: Record<string, string> = {
  ...Object.fromEntries(
    NAV.filter((item) => "href" in item).map((item) => [
      (item as { href: string; label: string }).href,
      (item as { href: string; label: string }).label,
    ])
  ),
  // Rotas acessíveis fora da sidebar (ex: dropdown do topbar)
  "/profile": "Meu Perfil",
};

export default function InsideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = getCookie<UserData>("userData");
    setUserData(storedUser);
    setTodayIso(getTodayIso());
    setCollapsed(localStorage.getItem("sidebarCollapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return next;
    });
  };

  // Fecha o menu ao trocar de página (relevante no mobile).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const userInitials = userData ? getUserInitials(userData.userName) : "—";
  const userName = userData?.userName ?? "Usuário";
  const userRole = userData?.role
    ? (ROLE_LABEL[userData.role] ?? userData.role)
    : "—";

  return (
    <FlowTourProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Backdrop do drawer (só mobile/tablet, quando aberto) */}
        {drawerOpen && (
          <div
            data-testid="drawer-backdrop"
            className="desktop:hidden fixed inset-0 z-[80] bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        )}

        <Sidebar.Root
          className={cn(
            "z-[90] w-[232px] shrink-0",
            // Mobile/tablet: drawer fixo que desliza da esquerda.
            "fixed inset-y-0 left-0 transition-[transform,width] duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop: volta a ser fixa em fluxo; largura varia se recolhida.
            "desktop:static desktop:z-auto desktop:translate-x-0",
            collapsed ? "desktop:w-[72px]" : "desktop:w-[232px]",
            // Âncora para o botão flutuante de recolher (borda direita).
            "desktop:relative"
          )}
        >
          {/* Recolher/expandir — botão flutuante na borda direita (só desktop;
            no mobile a sidebar é drawer). */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "absolute top-[74px] right-0 z-[95] hidden h-[24px] w-[24px] translate-x-1/2 items-center justify-center",
              "rounded-full border border-(--border) bg-(--bg2) text-(--muted) shadow-(--shadow-sm)",
              "desktop:flex cursor-pointer transition-colors hover:border-(--border2) hover:text-(--text)"
            )}
          >
            {collapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} />
            )}
          </button>

          <Sidebar.Brand collapsed={collapsed}>
            {/* Logo completa (expandida e sempre no drawer mobile). */}
            <Image
              src="/horizontal_logo.png"
              alt="Girus"
              width={1059}
              height={247}
              priority
              className={cn("h-auto w-full", collapsed && "desktop:hidden")}
            />
            {/* Só o ícone quando recolhida no desktop. `unoptimized` evita o
              otimizador do next/image, que recusa SVG sem dangerouslyAllowSVG. */}
            <Image
              src="/logo.svg"
              alt="Girus"
              width={1500}
              height={907}
              priority
              unoptimized
              className={cn(
                "hidden h-[28px] w-auto",
                collapsed && "desktop:block"
              )}
            />
          </Sidebar.Brand>

          <Sidebar.Content>
            {NAV.map((item, i) => {
              if ("divider" in item) return <Sidebar.Divider key={i} />;
              if ("section" in item)
                return (
                  <Sidebar.Section key={i} collapsed={collapsed}>
                    {item.section}
                  </Sidebar.Section>
                );

              if ("todayRoute" in item) {
                const { label, icon } = item as {
                  label: string;
                  icon: React.ElementType;
                };
                // Antes de resolver a data no cliente, aponta para a grade semanal
                // (evita divergência de hidratação com o horário do servidor).
                const href = todayIso ? `/routines/${todayIso}` : "/routines";
                return (
                  <Sidebar.Item
                    key="rota-do-dia"
                    href={href}
                    icon={icon}
                    active={isDayRoute}
                    collapsed={collapsed}
                    data-tour-route="/routines/today"
                  >
                    {label}
                  </Sidebar.Item>
                );
              }

              const { href, label, icon } = item as {
                href: string;
                label: string;
                icon: React.ElementType;
              };

              const isActive =
                href === "/routines"
                  ? pathname === "/routines"
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Sidebar.Item
                  key={href}
                  href={href}
                  icon={icon}
                  active={isActive}
                  collapsed={collapsed}
                  data-tour-route={href}
                >
                  {label}
                </Sidebar.Item>
              );
            })}
          </Sidebar.Content>

          <Sidebar.Bottom
            name={userName}
            role={userRole}
            initials={userInitials}
            collapsed={collapsed}
          />
        </Sidebar.Root>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar.Root>
            <Topbar.Breadcrumb>
              {/* Hambúrguer: abre o drawer no mobile/tablet; some no desktop. */}
              <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setDrawerOpen(true)}
                className="desktop:hidden mr-4 -ml-4 inline-flex cursor-pointer items-center justify-center rounded p-4 text-(--text) transition-colors hover:bg-(--bg3)"
              >
                <Menu size={20} strokeWidth={2} />
              </button>
              <span className="font-(--weight-semibold) text-(--text)">
                {pageLabel}
              </span>
            </Topbar.Breadcrumb>

            <Topbar.Actions>
              <Topbar.Status
                variant="online"
                label="API conectada"
                className="tablet:inline-flex hidden"
              />
              <Topbar.Separator className="tablet:block hidden" />
              <NotificationCenter />
              <UserMenu
                name={userName}
                role={userRole}
                initials={userInitials}
              />
            </Topbar.Actions>
          </Topbar.Root>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </FlowTourProvider>
  );
}
