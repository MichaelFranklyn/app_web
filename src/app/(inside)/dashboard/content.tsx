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
    isLoading,
    error,
    refetch,
  } = useDashboard(canSelectSeller);

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
          />

          <Card.Header.Group>
            <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
              <RecentOrdersTable orders={orders.slice(0, 4)} />
              <UpcomingVisitsCard items={upcomingVisits} />
            </Grid.Root>
          </Card.Header.Group>
        </>
      )}
    </PageContent>
  );
}
