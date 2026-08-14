import { PlanFeature } from "@/services/plan";
import { isAdminRole, isOwnerRole } from "@/utils/auth/roles";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  LayoutDashboard,
  Route,
  Tags,
  Target,
  UserCog,
  Users,
} from "lucide-react";

/** Quem vê o item — espelha o guard da rota de destino. */
export type NavAccess = "all" | "admin" | "owner";

/**
 * Papel e plano respondem perguntas diferentes e o item precisa passar nas
 * duas: `access` diz quem PODE (o gerente vê Pessoas, o vendedor não), e
 * `feature` diz o que a empresa CONTRATOU (o plano básico não tem rotina, para
 * ninguém). Item sem `feature` está em todo plano.
 */
export type NavFeature = PlanFeature;

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
    feature: "ROUTINES" as NavFeature,
  },
  { divider: true },
  { section: "Operações" },
  {
    href: "/routines",
    label: "Rotina da Semana",
    icon: CalendarDays,
    feature: "ROUTINES" as NavFeature,
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
    feature: "COMMISSIONS" as NavFeature,
  },
  {
    // Vendedor entra para acompanhar a própria meta; gestor, para definir as de
    // todo mundo. Mesma tela, sem guard de rota — daí `access` ausente.
    href: "/goals",
    label: "Metas",
    icon: Target,
    feature: "GOALS" as NavFeature,
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
    // Sem `feature`: a tela do plano existe em TODO plano — é onde se descobre
    // por que um botão parou de funcionar.
    href: "/settings/plan",
    label: "Plano",
    icon: BadgeCheck,
    access: "owner",
  },
  {
    href: "/settings/catalog",
    matchPrefix: "/settings/catalog",
    label: "Catálogos",
    icon: Tags,
    access: "admin",
  },
];

// Não existe item de plataforma neste menu: o SU nunca chega a renderizar esta
// casca. O middleware (`proxy.ts`) devolve qualquer rota do tenant para
// `/platform`, porque o sistema é de owner/admin/vendedor e a empresa onde a
// conta do SU está ancorada é exigência do modelo, não lugar de trabalho.
// Quando ele precisa entrar numa empresa, o caminho é a impersonação.

/**
 * Itens que o papel pode abrir, já sem os grupos que ficaram vazios: um vendedor
 * não vê nenhum destino de configuração, e um título "Configurações" solto (ou um
 * divisor no fim da lista) é sujeira visível.
 */
export const visibleNav = (
  role?: string | null,
  features: readonly NavFeature[] = []
) => {
  const isAdmin = isAdminRole(role);
  const isOwner = isOwnerRole(role);

  const allowed = NAV.filter((item) => {
    // Plano primeiro: recurso que a empresa não tem não existe para papel
    // nenhum, nem para o dono da conta.
    const feature = (item as { feature?: NavFeature }).feature;
    if (feature && !features.includes(feature)) return false;

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
