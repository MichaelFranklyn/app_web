export interface DashboardContentProps {
  // Se o usuário logado é gestor (OWNER/ADMIN/SU) e pode escolher o vendedor.
  // Resolvido no servidor (page.tsx) a partir do token.
  canSelectSeller: boolean;
  // Perfil de vendedor do PRÓPRIO gestor, se ele também vende — vira o default
  // do seletor (abre vendo os dados dele, podendo trocar). Null: sem perfil.
  ownSellerId?: string | null;
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

export interface OrdersByPeriodResponse {
  orders_by_period: {
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
