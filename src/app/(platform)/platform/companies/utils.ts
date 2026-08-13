import { FieldConfig } from "@/hooks/useTableFilters";
import { PlatformTenant } from "./interface";

/** Compartilhado entre `page.tsx` (SSR) e `content.tsx` — as variables do
 * primeiro fetch têm de bater byte a byte, senão o seed vira cache-miss. */
export const ITEMS_PER_PAGE = 10;

/** Chave do filtro na URL → campo que o backend entende (ver `ListPlatformTenantsUseCase`). */
export const TABLE_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search" },
  plan: { type: "select", queryField: "plan" },
  isActive: { type: "select", queryField: "is_active" },
};

/** Espelha o mapa de ordenação do `PlatformRepository`. Nome fora daqui é
 * ignorado pelo `useTableData` e cairia no padrão do backend de qualquer forma. */
export const SORTABLE_FIELDS = [
  "created_at",
  "razao_social",
  "plan",
  "is_active",
  "users_count",
  "clients_count",
  "orders_count",
  "orders_in_period",
  "gmv_in_period",
  "last_login_at",
];

export const PLAN_OPTIONS = [
  { value: "trial", label: "Teste" },
  { value: "basic", label: "Básico" },
  { value: "pro", label: "Pro" },
];

export const STATUS_OPTIONS = [
  { value: "true", label: "Ativas" },
  { value: "false", label: "Suspensas" },
];

/** Como a plataforma chama a empresa: o nome fantasia, quando existe. */
export const tenantName = (tenant: PlatformTenant): string =>
  tenant.nomeFantasia || tenant.razaoSocial;
