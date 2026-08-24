export interface DashboardContentProps {
  // Se o usuário logado é gestor (OWNER/ADMIN/SU) e pode escolher o vendedor.
  // Resolvido no servidor (page.tsx) a partir do token.
  canSelectSeller: boolean;
  // Perfil de vendedor do PRÓPRIO gestor, se ele também vende — vira o default
  // do seletor (abre vendo os dados dele, podendo trocar). Null: sem perfil.
  ownSellerId?: string | null;
  // A semana aberta, ancorada NO SERVIDOR (em BRT): é ela que define as
  // consultas semeadas, e recalcular no cliente arriscaria outra semana.
  initialRange: DateRangeIso;
  // Vendedor já escolhido pelo servidor. Sem isto, a tela precisava esperar a
  // lista de vendedores chegar para só então descobrir de quem eram os números
  // — duas idas à rede em fila, com o esqueleto na tela o tempo todo.
  initialSellerId: string | null;
  // Respostas trazidas pelo SSR, no shape das próprias queries (ver `useSeedQuery`).
  seed: DashboardSeed | null;
}

/** O que o servidor já buscou para a primeira pintura. Chave nula = falhou lá,
 * e o cliente busca por conta própria. */
export interface DashboardSeed {
  sellers: DashboardSellersResponse | null;
  orders: OrdersByPeriodResponse | null;
  recentOrders: RecentOrdersResponse | null;
  clients: CompanyClientsCountResponse | null;
  schedules: SchedulesByPeriodResponse | null;
}

export interface DateRangeIso {
  from: string;
  to: string;
}

export interface SellerOption {
  id: string;
  name: string;
}

export interface DashboardSellersResponse {
  dashboard_sellers: {
    edges: { node: SellerOption }[];
    totalCount: number;
  };
}

export type OrderStatus =
  | "DRAFT"
  | "SENT"
  | "CONFIRMED"
  | "DELIVERED"
  | "CANCELLED";

export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

export interface NamedEntity {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
}

export interface DashboardOrder {
  id: string;
  orderDate: string;
  totalAmount: string;
  status: OrderStatus;
  client: NamedEntity | null;
  factory: NamedEntity | null;
}

/** O que entra na soma do período: só o valor. */
export interface OrderAmount {
  id: string;
  totalAmount: string;
}

export interface OrdersByPeriodResponse {
  orders_by_period: {
    edges: { node: OrderAmount }[];
    totalCount: number;
  };
}

export interface RecentOrdersResponse {
  recent_orders: {
    edges: { node: DashboardOrder }[];
    totalCount: number;
  };
}

export interface CompanyClientsCountResponse {
  company_clients_count: {
    totalCount: number;
  };
}

export interface ScheduleItem {
  id: string;
  plannedOrder: number;
  status: VisitStatus;
  clientFactoryLink: {
    id: string;
    client: NamedEntity | null;
    factory: NamedEntity | null;
  } | null;
}

export interface ScheduleDay {
  id: string;
  date: string;
  items: ScheduleItem[];
}

export interface WeekSchedule {
  id: string;
  weekStart: string;
  status: string;
  days: ScheduleDay[];
}

export interface SchedulesByPeriodResponse {
  schedules_by_period: {
    edges: { node: WeekSchedule }[];
  };
}
