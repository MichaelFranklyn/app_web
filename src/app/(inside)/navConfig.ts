import {
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  Landmark,
  LayoutDashboard,
  Route,
  Settings,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";

export const ROLE_LABEL: Record<string, string> = {
  SU: "Super Admin",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};

export const NAV = [
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
    href: "/commissions",
    label: "Comissões",
    icon: Coins,
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
    adminOnly: true,
  },
  {
    href: "/sellers",
    label: "Vendedores",
    icon: UserCheck,
    adminOnly: true,
  },
  {
    // Aponta direto para a aba padrão para evitar o flash em branco do redirect
    // server-side de /settings. matchPrefix mantém o item ativo nas duas abas;
    // tourRoute preserva o seletor do tour ([data-tour-route="/settings"]).
    href: "/settings/catalog",
    matchPrefix: "/settings",
    tourRoute: "/settings",
    label: "Configurações",
    icon: Settings,
  },
];

// Itens visíveis apenas para o super usuário (SU) — administração da plataforma,
// acima de qualquer empresa. Anexados ao NAV só quando o role é SU.
export const SU_NAV = [
  { divider: true },
  { section: "Plataforma" },
  {
    href: "/companies",
    label: "Empresas",
    icon: Landmark,
  },
];

export const LABELS: Record<string, string> = {
  ...Object.fromEntries(
    NAV.filter((item) => "href" in item).map((item) => [
      (item as { href: string; label: string }).href,
      (item as { href: string; label: string }).label,
    ])
  ),
  // Rotas acessíveis fora da sidebar (ex: dropdown do topbar) ou gated por role
  "/profile": "Meu Perfil",
  "/companies": "Empresas",
};
