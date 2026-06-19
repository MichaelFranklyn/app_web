"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { getCookie } from "@/utils/cookies/clientCookie";
import { NotificationCenter } from "./_components/NotificationCenter";
import { UserMenu } from "./_components/UserMenu";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
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
  const pageLabel =
    LABELS[pathname] ??
    LABELS[
      Object.keys(LABELS)
        .filter((href) => pathname.startsWith(`${href}/`))
        .sort((a, b) => b.length - a.length)[0]
    ] ??
    "Dashboard";
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const data = getCookie<UserData>("userData");
    setUserData(data);
  }, []);

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar.Root className="w-58 shrink-0">
        <Sidebar.Brand>
          <Image
            src="/horizontal_logo.png"
            alt="Girus"
            width={1059}
            height={247}
            priority
            className="h-auto w-full"
          />
        </Sidebar.Brand>

        <Sidebar.Content>
          {NAV.map((item, i) => {
            if ("divider" in item) return <Sidebar.Divider key={i} />;
            if ("section" in item)
              return <Sidebar.Section key={i}>{item.section}</Sidebar.Section>;

            const { href, label, icon } = item as {
              href: string;
              label: string;
              icon: React.ElementType;
            };

            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Sidebar.Item
                key={href}
                href={href}
                icon={icon}
                active={isActive}
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
        />
      </Sidebar.Root>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar.Root>
          <Topbar.Breadcrumb>
            <span className="font-(--weight-semibold) text-(--text)">
              {pageLabel}
            </span>
          </Topbar.Breadcrumb>

          <Topbar.Actions>
            <Topbar.Status variant="online" label="API conectada" />
            <Topbar.Separator />
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
  );
}
