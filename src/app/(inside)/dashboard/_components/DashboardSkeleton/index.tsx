import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";

const KPI_COUNT = 4;
const ORDER_ROWS = 4;
const VISIT_ROWS = 5;

/** Placeholder de uma linha do card de próximas visitas. */
function VisitRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-10">
      <Loading.Skeleton className="h-12 w-40" />
      <div className="flex items-center gap-8">
        <Loading.Skeleton className="h-12 w-24" />
        <Loading.Skeleton shape="pill" className="h-4.5 w-10" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <Card.Kpi.Group>
        {Array.from({ length: KPI_COUNT }).map((_, i) => (
          <Card.Kpi.Skeleton key={i} />
        ))}
      </Card.Kpi.Group>

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Table.Root>
          <Table.CardHead className="min-h-13.75">
            <Loading.Skeleton className="h-16 w-40" />
            <Loading.Skeleton className="h-7.5 w-28" />
          </Table.CardHead>
          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Cliente</Table.Head>
                <Table.Head>Fábrica</Table.Head>
                <Table.Head>Valor</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Skeleton columns={4} rows={ORDER_ROWS} />
            </Table.Body>
          </Table.Table>
        </Table.Root>

        <Card.Root>
          <Card.Header>
            <Loading.Skeleton className="h-16 w-36" />
            <div className="flex items-center gap-6">
              <Loading.Skeleton shape="pill" className="h-20 w-20" />
              <Loading.Skeleton className="h-7.5 w-28" />
            </div>
          </Card.Header>
          <Card.Body padding="compact">
            {Array.from({ length: VISIT_ROWS }).map((_, i) => (
              <VisitRowSkeleton key={i} />
            ))}
          </Card.Body>
        </Card.Root>
      </Grid.Root>
    </>
  );
}
