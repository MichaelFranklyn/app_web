"use client";

import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import {
  PLATFORM_TENANT_QUERY,
  TENANT_ACTIVITY_QUERY,
  TENANT_ACTIVITY_SUMMARY_QUERY,
  TENANT_AUDIT_QUERY,
  TENANT_USERS_QUERY,
} from "./gql";
import {
  TenantActivityQueryData,
  TenantActivitySummaryQueryData,
  TenantAuditQueryData,
  TenantDetailContentProps,
  TenantQueryData,
  TenantUsersQueryData,
} from "./interface";
import { ACTIVITY_LIMIT, AUDIT_LIMIT, USERS_LIMIT } from "./utils";

/** Filtros das listas da ficha. Extraídos porque as variables precisam ser
 * IDÊNTICAS às do SSR, senão o seed vira cache-miss. */
export const usersVariables = (companyId: string) => ({
  input: {
    first: USERS_LIMIT,
    after: null,
    filters: [{ field: "company_id", value: companyId }],
  },
});

export const auditVariables = (companyId: string) => ({
  input: {
    first: AUDIT_LIMIT,
    after: null,
    filters: [{ field: "target_company_id", value: companyId }],
  },
});

export const activityVariables = (companyId: string) => ({
  input: {
    first: ACTIVITY_LIMIT,
    after: null,
    filters: [{ field: "company_id", value: companyId }],
  },
});

/**
 * Dados e ações da ficha do tenant.
 *
 * Depois de suspender ou trocar o plano, refaz as TRÊS consultas: a ficha muda,
 * a trilha ganha uma linha e a lista de pessoas pode ter mudado de estado. Um
 * refetch parcial deixaria a auditoria da própria tela desatualizada logo após
 * a ação que ela deveria registrar.
 */
export function useTenantDetail({
  id,
  seedTenant,
  seedUsers,
  seedAudit,
  seedActivity,
  seedActivitySummary,
}: TenantDetailContentProps) {
  useSeedQuery(
    [
      { query: PLATFORM_TENANT_QUERY, variables: { id }, data: seedTenant },
      {
        query: TENANT_USERS_QUERY,
        variables: usersVariables(id),
        data: seedUsers,
      },
      {
        query: TENANT_AUDIT_QUERY,
        variables: auditVariables(id),
        data: seedAudit,
      },
      {
        query: TENANT_ACTIVITY_QUERY,
        variables: activityVariables(id),
        data: seedActivity,
      },
      {
        query: TENANT_ACTIVITY_SUMMARY_QUERY,
        variables: { companyId: id },
        data: seedActivitySummary,
      },
    ],
    id
  );

  const tenantQuery = useQuery<TenantQueryData>(PLATFORM_TENANT_QUERY, {
    variables: { id },
  });
  const usersQuery = useQuery<TenantUsersQueryData>(TENANT_USERS_QUERY, {
    variables: usersVariables(id),
  });
  const auditQuery = useQuery<TenantAuditQueryData>(TENANT_AUDIT_QUERY, {
    variables: auditVariables(id),
  });
  const activityQuery = useQuery<TenantActivityQueryData>(
    TENANT_ACTIVITY_QUERY,
    {
      variables: activityVariables(id),
    }
  );
  const summaryQuery = useQuery<TenantActivitySummaryQueryData>(
    TENANT_ACTIVITY_SUMMARY_QUERY,
    { variables: { companyId: id } }
  );

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const refetchAll = useCallback(() => {
    void tenantQuery.refetch();
    void usersQuery.refetch();
    void auditQuery.refetch();
    void activityQuery.refetch();
  }, [tenantQuery, usersQuery, auditQuery, activityQuery]);

  return {
    tenant: tenantQuery.data?.platformTenant?.data ?? null,
    tenantLoading: tenantQuery.loading,
    tenantError: tenantQuery.error,
    refetchTenant: tenantQuery.refetch,

    users: usersQuery.data?.tenant_users?.edges?.map((e) => e.node) ?? [],
    usersLoading: usersQuery.loading,

    auditEntries:
      auditQuery.data?.tenant_audit?.edges?.map((e) => e.node) ?? [],

    activityEntries:
      activityQuery.data?.tenant_activity?.edges?.map((e) => e.node) ?? [],
    activityTotal: activityQuery.data?.tenant_activity?.totalCount ?? 0,
    activityLoading: activityQuery.loading,

    activitySummary: summaryQuery.data?.platformActivitySummary?.data ?? null,
    activitySummaryLoading: summaryQuery.loading,

    statusModalOpen,
    setStatusModalOpen,
    planModalOpen,
    setPlanModalOpen,
    refetchAll,
  };
}
