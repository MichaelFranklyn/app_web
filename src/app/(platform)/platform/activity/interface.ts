import { ActivitySummary } from "../interface";

export interface ActivityRow {
  id: string;
  createdAt: string;
  /** Nome do campo da mutation (`createOrder`) — sem semântica de negócio. */
  operation: string;
  status: string;
  errorMessage: string | null;
  durationMs: number | null;
  companyId: string | null;
  userEmail: string | null;
  userRole: string | null;
  /** UUIDs que apareceram na requisição: em qual registro a ação mexeu. */
  targetIds: string[] | null;
}

export interface ActivityQueryData {
  platform_activity: {
    edges: { node: ActivityRow }[];
    totalCount: number;
  };
}

export interface ActivitySummaryQueryData {
  platformActivitySummary: { data: ActivitySummary | null };
}

export interface CompanyNameQueryData {
  platformTenant: {
    data: {
      id: string;
      razaoSocial: string;
      nomeFantasia: string | null;
    } | null;
  };
}

export interface ActivityContentProps {
  /** Recorte de uma empresa só, vindo de `?company=`. Nulo = plataforma toda. */
  companyId: string | null;
  /** Nome resolvido no servidor; nulo quando não há recorte (ou a busca falhou). */
  companyName: string | null;
  initialData: ActivityQueryData | null;
  seedSummary: ActivitySummaryQueryData | null;
}
