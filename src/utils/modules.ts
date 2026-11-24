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
 * Ícone do header de cada página — o mesmo do item da navegação que leva até
 * ela. A cor é sempre a da marca (18/11/2026), não a do módulo. Registro único porque o header real e o
 * `loading.tsx` (que é server e não pode passar componente para o skeleton
 * client) precisam do MESMO par; o skeleton recebe só a chave.
 */
export const PAGE_HEADING = {
  dashboard: { icon: LayoutDashboard },
  analytics: { icon: ChartLine },
  reports: { icon: FileText },
  priorities: { icon: ListChecks },
  agenda: { icon: CalendarDays },
  planWeek: { icon: CalendarPlus },
  orders: { icon: ClipboardList },
  newOrder: { icon: ClipboardPlus },
  commissions: { icon: Coins },
  goals: { icon: Target },
  clients: { icon: Users },
  networks: { icon: Network },
  hygiene: { icon: Eraser },
  support: { icon: Headset },
  factories: { icon: Building2 },
  product: { icon: Package },
  priceList: { icon: Receipt },
  catalog: { icon: Tags },
  company: { icon: Building2 },
  plan: { icon: BadgeCheck },
  users: { icon: UserCog },
  import: { icon: Import },
  // Console da plataforma (`/platform`): mesmo ícone do item do `PLATFORM_NAV`.
  platformOverview: { icon: LayoutDashboard },
  platformCompanies: { icon: Building2 },
  platformUsers: { icon: UserCog },
  platformPlans: { icon: BadgeCheck },
  platformTeam: { icon: ShieldCheck },
  platformActivity: { icon: History },
  platformAudit: { icon: ScrollText },
  platformHealth: { icon: Activity },
  platformEmails: { icon: Mail },
} satisfies Record<string, { icon: LucideIcon }>;

export type PageHeadingKey = keyof typeof PAGE_HEADING;
