import { ThemeColor } from "@/lib/theme";
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarDays,
  CalendarPlus,
  ChartLine,
  ClipboardList,
  ClipboardPlus,
  Coins,
  Eraser,
  FileText,
  History,
  Headset,
  Import,
  LayoutDashboard,
  ListChecks,
  Mail,
  LucideIcon,
  Network,
  Package,
  Receipt,
  ScrollText,
  ShieldCheck,
  Tags,
  Target,
  UserCog,
  Users,
} from "lucide-react";

/**
 * Os módulos do produto, para a cor do ícone no header de cada página.
 *
 * `sales` junta pedidos, comissões e metas: o amarelo do diagrama de módulos é
 * âmbar, e âmbar parado é proibido (âmbar = o que se clica; ver
 * `amberStatic.guard.test.ts`). Fica no azul do vendedor, que é de quem são as
 * três telas.
 */
export type AppModule =
  | "identity"
  | "factories"
  | "clients"
  | "products"
  | "sales"
  | "import"
  | "routine"
  | "intel";

/** Mesmos hex de `--mod-*` no `globals.css`. Página nova usa o do seu módulo. */
export const MODULE_COLOR: Record<AppModule, ThemeColor> = {
  identity: "blue",
  factories: "orange",
  clients: "green",
  products: "purple",
  sales: "blue",
  import: "orange",
  routine: "cyan",
  intel: "pink",
};

/**
 * Ícone e cor do header de cada página — o ícone é o mesmo do item da
 * navegação que leva até ela. Registro único porque o header real e o
 * `loading.tsx` (que é server e não pode passar componente para o skeleton
 * client) precisam do MESMO par; o skeleton recebe só a chave.
 */
export const PAGE_HEADING = {
  dashboard: { icon: LayoutDashboard, color: MODULE_COLOR.intel },
  analytics: { icon: ChartLine, color: MODULE_COLOR.intel },
  reports: { icon: FileText, color: MODULE_COLOR.intel },
  priorities: { icon: ListChecks, color: MODULE_COLOR.routine },
  agenda: { icon: CalendarDays, color: MODULE_COLOR.routine },
  planWeek: { icon: CalendarPlus, color: MODULE_COLOR.routine },
  orders: { icon: ClipboardList, color: MODULE_COLOR.sales },
  newOrder: { icon: ClipboardPlus, color: MODULE_COLOR.sales },
  commissions: { icon: Coins, color: MODULE_COLOR.sales },
  goals: { icon: Target, color: MODULE_COLOR.sales },
  clients: { icon: Users, color: MODULE_COLOR.clients },
  networks: { icon: Network, color: MODULE_COLOR.clients },
  hygiene: { icon: Eraser, color: MODULE_COLOR.clients },
  support: { icon: Headset, color: MODULE_COLOR.clients },
  factories: { icon: Building2, color: MODULE_COLOR.factories },
  product: { icon: Package, color: MODULE_COLOR.products },
  priceList: { icon: Receipt, color: MODULE_COLOR.products },
  catalog: { icon: Tags, color: MODULE_COLOR.products },
  plan: { icon: BadgeCheck, color: MODULE_COLOR.identity },
  users: { icon: UserCog, color: MODULE_COLOR.identity },
  import: { icon: Import, color: MODULE_COLOR.import },
  // Console da plataforma (`/platform`): mesmo ícone do item do
  // `PLATFORM_NAV`. Quem governa contas (empresas, pessoas, planos, equipe) é
  // identity; o que só se LÊ para acompanhar (visão geral, histórico,
  // auditoria, saúde, emails) é intel — como dashboard e relatórios.
  platformOverview: { icon: LayoutDashboard, color: MODULE_COLOR.intel },
  platformCompanies: { icon: Building2, color: MODULE_COLOR.identity },
  platformUsers: { icon: UserCog, color: MODULE_COLOR.identity },
  platformPlans: { icon: BadgeCheck, color: MODULE_COLOR.identity },
  platformTeam: { icon: ShieldCheck, color: MODULE_COLOR.identity },
  platformActivity: { icon: History, color: MODULE_COLOR.intel },
  platformAudit: { icon: ScrollText, color: MODULE_COLOR.intel },
  platformHealth: { icon: Activity, color: MODULE_COLOR.intel },
  platformEmails: { icon: Mail, color: MODULE_COLOR.intel },
} satisfies Record<string, { icon: LucideIcon; color: ThemeColor }>;

export type PageHeadingKey = keyof typeof PAGE_HEADING;
