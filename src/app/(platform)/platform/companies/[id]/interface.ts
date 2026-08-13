import { ActivitySummary } from "../../interface";
import { PlatformTenant } from "../interface";

export interface TenantDetail extends PlatformTenant {
  maxUsers: number | null;
  maxSellers: number | null;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  companyId: string;
  companyName: string;
}

export interface TenantAuditEntry {
  id: string;
  createdAt: string;
  action: string;
  actorEmail: string;
  targetLabel: string | null;
  reason: string | null;
  payload: Record<string, unknown> | null;
}

export interface TenantActivityEntry {
  id: string;
  createdAt: string;
  /** Nome do campo da mutation (`createOrder`) — traduzido só na tela. */
  operation: string;
  status: string;
  errorMessage: string | null;
  userEmail: string | null;
  userRole: string | null;
}

export interface TenantQueryData {
  platformTenant: { data: TenantDetail | null };
}

export interface TenantUsersQueryData {
  tenant_users: { edges: { node: TenantUser }[]; totalCount: number };
}

export interface TenantAuditQueryData {
  tenant_audit: { edges: { node: TenantAuditEntry }[]; totalCount: number };
}

export interface TenantActivitySummaryQueryData {
  platformActivitySummary: { data: ActivitySummary | null };
}

export interface TenantActivityQueryData {
  tenant_activity: {
    edges: { node: TenantActivityEntry }[];
    totalCount: number;
  };
}

export interface AccessLinkResult {
  link: string;
  userEmail: string;
  userName: string;
}

/** Envelope `DataResponse` do backend, comum a todas as mutations do console. */
interface MutationResponse<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface SetTenantStatusData {
  setTenantStatus: MutationResponse<
    Pick<TenantDetail, "id" | "isActive" | "suspendedAt" | "suspensionReason">
  >;
}

export interface UpdateTenantPlanData {
  updateTenantPlan: MutationResponse<
    Pick<
      TenantDetail,
      "id" | "plan" | "trialEndsAt" | "maxUsers" | "maxSellers"
    >
  >;
}

export interface IssueAccessLinkData {
  issueTenantAccessLink: MutationResponse<AccessLinkResult>;
}

export interface ImpersonationResult {
  accessToken: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  role: string;
  sellerId: string | null;
  expiresInMinutes: number;
}

export interface TenantDetailContentProps {
  id: string;
  seedTenant: TenantQueryData | null;
  seedUsers: TenantUsersQueryData | null;
  seedAudit: TenantAuditQueryData | null;
  seedActivity: TenantActivityQueryData | null;
  seedActivitySummary: TenantActivitySummaryQueryData | null;
}
