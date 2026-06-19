"use client";

import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { DashboardHeader } from "./_components/DashboardHeader";
import { DashboardKpis } from "./_components/DashboardKpis";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { RecentOrdersTable } from "./_components/RecentOrdersTable";
import { UpcomingVisitsCard } from "./_components/UpcomingVisitsCard";
import {
  COMPANY_CLIENTS_COUNT_QUERY,
  ORDERS_BY_PERIOD_QUERY,
  SCHEDULES_BY_PERIOD_QUERY,
} from "./gql";
import {
  CompanyClientsCountResponse,
  DateRangeIso,
  OrdersByPeriodResponse,
  SchedulesByPeriodResponse,
} from "./interface";
import { getCurrentWeekRangeIso } from "./utils";

export default function DashboardContent() {
  const initialRange = useMemo(getCurrentWeekRangeIso, []);
  const [range, setRange] = useState<DateRangeIso>(initialRange);

  const ordersByPeriod = useQuery<OrdersByPeriodResponse>(
    ORDERS_BY_PERIOD_QUERY,
    {
      variables: {
        input: {
          first: 100,
          filters: [
            { field: "order_date", operator: "gte", value: range.from },
            { field: "order_date", operator: "lte", value: range.to },
          ],
          order: { by: "created_at", dir: "desc" },
        },
      },
    }
  );

  const clientsCount = useQuery<CompanyClientsCountResponse>(
    COMPANY_CLIENTS_COUNT_QUERY,
    { variables: { input: { first: 1 } } }
  );

  const schedulesByPeriod = useQuery<SchedulesByPeriodResponse>(
    SCHEDULES_BY_PERIOD_QUERY,
    {
      variables: {
        input: {
          first: 20,
          filters: [
            { field: "week_start", operator: "gte", value: range.from },
            { field: "week_start", operator: "lte", value: range.to },
          ],
        },
      },
    }
  );

  const orders =
    ordersByPeriod.data?.orders_by_period.edges.map((e) => e.node) ?? [];
  const totalOrders = ordersByPeriod.data?.orders_by_period.totalCount ?? 0;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const totalClients = clientsCount.data?.company_clients_count.totalCount ?? 0;

  const schedules =
    schedulesByPeriod.data?.schedules_by_period.edges.map((e) => e.node) ?? [];
  const allItems = schedules.flatMap((s) => s.days.flatMap((d) => d.items));
  const completedVisits = allItems.filter((i) => i.status === "COMPLETED").length;
  const totalPlannedVisits = allItems.length;
  const upcomingVisits = allItems
    .filter((i) => i.status === "PENDING")
    .slice(0, 5);

  const isLoading =
    ordersByPeriod.loading ||
    clientsCount.loading ||
    schedulesByPeriod.loading;

  return (
    <PageContent>
      <DashboardHeader range={range} onRangeChange={setRange} />

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
