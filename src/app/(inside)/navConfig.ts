import { isAdminRole, isOwnerRole } from "@/utils/auth/roles";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  Landmark,
  LayoutDashboard,
  Route,
  Tags,
  Target,
  UserCog,
  Users,
} from "lucide-react";

/** Quem vê o item — espelha o guard da rota de destino. */
export type NavAccess = "all" | "admin" | "owner";

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
    // Vendedor entra para acompanhar a própria meta; gestor, para definir as de
    // todo mundo. Mesma tela, sem guard de rota — daí `access` ausente.
    href: "/goals",
    label: "Metas",
    icon: Target,
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
  // Configuração desdobrada: em vez de um item único levando ao hub, cada assunto
  // é um destino na sidebar. Quem precisa mexer no catálogo chega em um clique, e
  // não em três. `access` espelha o guard da rota — item que leva a um redirect é
  // pior do que item ausente (mesma regra do hub, em settings/utils.ts).
  { section: "Configurações" },
  {
    href: "/settings/company",
    label: "Empresa",
    icon: Building2,
    access: "owner",
  },
  {
    href: "/settings/users",
    matchPrefix: "/settings/users",
    label: "Pessoas",
    icon: UserCog,
    access: "admin",
  },
  {
    href: "/settings/catalog",
    matchPrefix: "/settings/catalog",
    label: "Catálogos",
    icon: Tags,
    access: "admin",
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

/**
 * Itens que o papel pode abrir, já sem os grupos que ficaram vazios: um vendedor
 * não vê nenhum destino de configuração, e um título "Configurações" solto (ou um
 * divisor no fim da lista) é sujeira visível.
 */
export const visibleNav = (role?: string | null) => {
  const isAdmin = isAdminRole(role);
  const isOwner = isOwnerRole(role);

  const allowed = NAV.filter((item) => {
    const access = (item as { access?: NavAccess }).access;
    if (!access || access === "all") return true;
    return access === "owner" ? isOwner : isAdmin;
  });

  // Segunda passada: descarta seção sem nenhum destino depois dela e divisor que
  // ficou encostado em outro (ou no fim).
  return allowed.filter((item, index) => {
    if ("section" in item) {
      const next = allowed[index + 1];
      return !!next && !("section" in next) && !("divider" in next);
    }
    if ("divider" in item) {
      const next = allowed[index + 1];
      if (!next || "divider" in next) return false;
      // Divisor antes de uma seção que vai cair também não deve sobrar.
      if ("section" in next) {
        const afterSection = allowed[index + 2];
        return (
          !!afterSection &&
          !("section" in afterSection) &&
          !("divider" in afterSection)
        );
      }
    }
    return true;
  });
};
