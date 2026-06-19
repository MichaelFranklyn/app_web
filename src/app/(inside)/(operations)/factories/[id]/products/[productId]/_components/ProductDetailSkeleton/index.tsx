import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";

/**
 * Placeholder da página de detalhe do produto — espelha o layout real:
 * cabeçalho + Grid 2/3 (preços nas tabelas) e 1/3 (informações + impostos).
 */
export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-20">
      {/* Cabeçalho — espelha ProductDetailHeader (breadcrumb + PanelHeader). */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <Loading.Skeleton className="h-[12px] w-16" />
          <Loading.Skeleton className="h-[12px] w-28" />
        </div>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Eyebrow>
                <Loading.Skeleton className="h-[10px] w-32" />
              </PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[22px] w-64" />
              <Loading.Skeleton className="mt-[6px] h-[12px] w-96 max-w-full" />
              <PanelHeader.Actions className="mt-6">
                <Loading.Skeleton className="h-[22px] w-16 rounded-(--r-xs)" />
                <Loading.Skeleton className="h-[36px] w-28" />
                <Loading.Skeleton className="h-[36px] w-10" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      {/* Conteúdo — espelha o Grid 2/3 + 1/3. */}
      <Grid cols={{ base: 1, desktop: 3 }} gap={20}>
        {/* Preços nas tabelas (2/3). */}
        <Grid.Item span={{ base: 1, desktop: 2 }} className="min-w-0">
          <Table.Root>
            <Table.CardHead>
              <Loading.Skeleton className="h-[16px] w-40" />
              <Table.CardHead.Actions>
                <Loading.Skeleton className="h-[34px] w-70" />
                <Loading.Skeleton className="h-[34px] w-32" />
              </Table.CardHead.Actions>
            </Table.CardHead>
            <Table.Table>
              <Table.Body>
                <Table.Skeleton columns={5} rows={4} />
              </Table.Body>
            </Table.Table>
            <Table.Footer>
              <Loading.Skeleton className="h-[12px] w-40" />
              <Loading.Skeleton className="h-[28px] w-48" />
            </Table.Footer>
          </Table.Root>
        </Grid.Item>

        {/* Informações + Impostos incidentes (1/3). */}
        <Grid.Item
          span={{ base: 1, desktop: 1 }}
          className="flex flex-col gap-12"
        >
          <Card.Root>
            <Card.Header>
              <Loading.Skeleton className="h-[14px] w-28" />
            </Card.Header>
            <Card.Body padding="compact">
              <div className="flex flex-col gap-12">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-8"
                  >
                    <Loading.Skeleton className="h-[12px] w-20" />
                    <Loading.Skeleton className="h-[12px] w-16" />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card.Root>

          <Table.Root>
            <Table.CardHead>
              <Loading.Skeleton className="h-[16px] w-36" />
              <Table.CardHead.Actions>
                <Loading.Skeleton className="h-[34px] w-32" />
              </Table.CardHead.Actions>
            </Table.CardHead>
            <Table.Table>
              <Table.Body>
                <Table.Skeleton columns={4} rows={3} />
              </Table.Body>
            </Table.Table>
          </Table.Root>
        </Grid.Item>
      </Grid>
    </div>
  );
}
