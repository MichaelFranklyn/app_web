import { PlanFeature } from "@/services/plan";
import { isAdminRole, isOwnerRole } from "@/utils/auth/roles";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  Headset,
  LayoutDashboard,
  ListChecks,
  PhoneCall,
  Route,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

/**
 * Preferência de sidebar recolhida. Vive em COOKIE, e não em localStorage, para
 * o servidor conseguir ler e já renderizar a largura certa: com localStorage o
 * primeiro render saía sempre expandido (232px) e recolhia logo depois, jogando
 * o conteúdo 160px para o lado em toda tela de dentro.
 */
export const SIDEBAR_COLLAPSED_COOKIE = "sidebarCollapsed";

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
  {
    // A ÚNICA lista de trabalho: uma linha por compromisso, com prioridade,
    // prazo e o caminho até onde se resolve. Sem `feature` e sem `access`: o
    // recorte (as minhas / as da empresa) é no resolver, e o que o plano não
    // tem (rotina) simplesmente não gera pendência.
    href: "/pending",
    label: "Pendências",
    icon: ListChecks,
  },
  {
    // Onde vale agir para vender mais (a antiga /insights, que redireciona
    // para cá). Sem `feature`: a leitura é da carteira, calculada na hora.
    href: "/opportunities",
    label: "Oportunidades",
    icon: Sparkles,
  },
  { divider: true },
  { section: "Operações" },
  {
    href: "/routines",
    label: "Agenda",
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
    // Sem `feature` e sem `access`: reclamação de cliente é operação básica, e
    // o vendedor entra para ver os casos dos clientes DELE (o recorte é no
    // resolver, não no menu).
    href: "/support",
    matchPrefix: "/support",
    label: "Reclamações",
    icon: Headset,
  },
  {
    // Contatos agendados (follow-up). Sem `feature` e sem `access`: o vendedor
    // vê os dele, o gestor os da empresa — o recorte é no resolver.
    href: "/follow-ups",
    matchPrefix: "/follow-ups",
    label: "Contatos agendados",
    icon: PhoneCall,
  },
  {
    href: "/factories",
    label: "Fábricas",
    icon: Building2,
  },
  { divider: true },
  {
    // Um item só: as telas (Empresa, Plano, Pessoas, Catálogos, Trazer dados)
    // se escolhem no menu interno da área (`settings/navigation.ts`). Antes
    // eram cinco itens soltos aqui. `access: "admin"` porque toda tela da
    // área é de gestão — e o vendedor, em `/settings`, seria mandado ao perfil.
    href: "/settings",
    matchPrefix: "/settings",
    label: "Configurações",
    icon: Settings,
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
