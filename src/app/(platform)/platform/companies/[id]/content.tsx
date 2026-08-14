"use client";

import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { SuspendTenantModal } from "./_components/SuspendTenantModal";
import { TenantActivityCard } from "./_components/TenantActivityCard";
import { TenantActivityChart } from "./_components/TenantActivityChart";
import { TenantAuditCard } from "./_components/TenantAuditCard";
import { TenantHeader } from "./_components/TenantHeader";
import { TenantPlanCard } from "./_components/TenantPlanCard";
import { TenantPlanModal } from "./_components/TenantPlanModal";
import { TenantUsageCard } from "./_components/TenantUsageCard";
import { TenantUsersCard } from "./_components/TenantUsersCard";
import { TenantDetailContentProps } from "./interface";
import { useTenantDetail } from "./useTenantDetail";

export default function TenantDetailContent(props: TenantDetailContentProps) {
  const {
    tenant,
    tenantLoading,
    tenantError,
    refetchTenant,
    users,
    usersLoading,
    auditEntries,
    activityEntries,
    activityTotal,
    activityLoading,
    activitySummary,
    activitySummaryLoading,
    statusModalOpen,
    setStatusModalOpen,
    planModalOpen,
    setPlanModalOpen,
    refetchAll,
  } = useTenantDetail(props);

  if (tenantError && !tenant) {
    return (
      <PageContent>
        <QueryError onRetry={() => refetchTenant()} />
      </PageContent>
    );
  }

  if (!tenant) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[80px] w-full" />
        <Loading.Skeleton className="h-[200px] w-full" />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <TenantHeader
        tenant={tenant}
        onToggleStatus={() => setStatusModalOpen(true)}
        onEditPlan={() => setPlanModalOpen(true)}
      />

      <TenantPlanCard tenant={tenant} />
      <TenantUsageCard tenant={tenant} />
      <TenantUsersCard users={users} loading={usersLoading || tenantLoading} />
      <TenantActivityChart
        summary={activitySummary}
        loading={activitySummaryLoading}
      />
      <TenantActivityCard
        companyId={tenant.id}
        entries={activityEntries}
        total={activityTotal}
        loading={activityLoading}
      />
      <TenantAuditCard entries={auditEntries} />

      <SuspendTenantModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        companyId={tenant.id}
        companyName={tenant.nomeFantasia || tenant.razaoSocial}
        isSuspending={tenant.isActive}
        onDone={refetchAll}
      />

      {/* Montado só quando aberto: o formulário inicializa o estado a partir do
          tenant, e uma instância viva ficaria com os valores velhos depois de
          um refetch. */}
      {planModalOpen && (
        <TenantPlanModal
          open
          onOpenChange={setPlanModalOpen}
          tenant={tenant}
          onDone={refetchAll}
        />
      )}
    </PageContent>
  );
}
