"use client";

import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { DashboardHeader } from "./_components/DashboardHeader";
import { DashboardKpis } from "./_components/DashboardKpis";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { RecentOrdersTable } from "./_components/RecentOrdersTable";
import { UpcomingVisitsCard } from "./_components/UpcomingVisitsCard";
import { useDashboard } from "./useDashboard";

export default function DashboardContent() {
  const {
    range,
    setRange,
    canSelectSeller,
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
  } = useDashboard();

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
      ) : (
        <>
          <DashboardKpis
            totalOrders={totalOrders}
            totalRevenue={totalRevenue}
            completedVisits={completedVisits}
            totalPlannedVisits={totalPlannedVisits}
            totalClients={totalClients}
          />

          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
            <RecentOrdersTable orders={orders.slice(0, 4)} />
            <UpcomingVisitsCard items={upcomingVisits} />
          </Grid.Root>
        </>
      )}
    </PageContent>
  );
}
