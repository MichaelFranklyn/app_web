export interface PlatformTenant {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  segment: string;
  plan: string;
  logoUrl: string | null;
  isActive: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  usersCount: number;
  sellersCount: number;
  clientsCount: number;
  factoriesCount: number;
  ordersCount: number;
  ordersInPeriod: number;
  gmvInPeriod: number;
  /** Login mais recente de QUALQUER pessoa da empresa. Nulo = ninguém entrou. */
  lastLoginAt: string | null;
  lastOrderDate: string | null;
}

export interface QueryData {
  platform_tenants: {
    edges: { node: PlatformTenant }[];
    totalCount: number;
  };
}

export interface TenantsContentProps {
  initialData: QueryData | null;
}
