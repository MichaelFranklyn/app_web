"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { DashboardHeader } from "./_components/DashboardHeader";
import { DashboardKpis } from "./_components/DashboardKpis";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { RecentOrdersTable } from "./_components/RecentOrdersTable";
import { UpcomingVisitsCard } from "./_components/UpcomingVisitsCard";
import { DashboardContentProps } from "./interface";
import { useDashboard } from "./useDashboard";

export default function DashboardContent({
  canSelectSeller,
  ownSellerId,
  initialRange,
  initialSellerId,
  seed,
}: DashboardContentProps) {
  const {
    range,
    setRange,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    selectedSellerName,
    orders,
    totalOrders,
    totalRevenue,
    totalClients,
    completedVisits,
    totalPlannedVisits,
    upcomingVisits,
    hasRoutines,
    isLoading,
    error,
    refetch,
  } = useDashboard({
    canSelectSeller,
    ownSellerId,
    initialRange,
    initialSellerId,
    seed,
  });

  return (
    <PageContent>
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        canSelectSeller={canSelectSeller}
        sellers={sellers}
        selectedSellerId={selectedSellerId}
        selectedSellerName={selectedSellerName}
        onSelectSeller={setSelectedSellerId}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <QueryError onRetry={refetch} />
      ) : (
        <>
          <DashboardKpis
            totalOrders={totalOrders}
            totalRevenue={totalRevenue}
            completedVisits={completedVisits}
            totalPlannedVisits={totalPlannedVisits}
            totalClients={totalClients}
            hasRoutines={hasRoutines}
          />

          <Card.Header.Group>
            {/* Sem rotina no plano, os pedidos recentes ocupam a linha inteira —
                metade da tela vazia diria "faltou carregar", não "não contratado". */}
            <Grid.Root
              cols={{ base: 1, desktop: hasRoutines ? 2 : 1 }}
              gap={12}
            >
              <RecentOrdersTable orders={orders} />
              {hasRoutines && <UpcomingVisitsCard items={upcomingVisits} />}
            </Grid.Root>
          </Card.Header.Group>
        </>
      )}
    </PageContent>
  );
}
