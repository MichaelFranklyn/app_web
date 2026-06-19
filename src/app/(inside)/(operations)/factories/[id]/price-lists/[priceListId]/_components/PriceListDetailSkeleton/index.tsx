import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";

/**
 * Placeholder da página de detalhe da tabela de preço — espelha o layout real:
 * cabeçalho + a tabela de itens (largura total).
 */
export function PriceListDetailSkeleton() {
  return (
    <div className="flex flex-col gap-20">
      {/* Cabeçalho — espelha PriceListDetailHeader (breadcrumb + PanelHeader). */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <Loading.Skeleton className="h-[12px] w-16" />
          <Loading.Skeleton className="h-[12px] w-32" />
        </div>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Eyebrow>
                <Loading.Skeleton className="h-[10px] w-40" />
              </PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[22px] w-56" />
              <Loading.Skeleton className="mt-[6px] h-[12px] w-72 max-w-full" />
              <PanelHeader.Actions className="mt-6">
                <Loading.Skeleton className="h-[22px] w-16 rounded-(--r-xs)" />
                <Loading.Skeleton className="h-[36px] w-28" />
                <Loading.Skeleton className="h-[36px] w-10" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      {/* Itens da tabela — espelha ItemsTable (largura total). */}
      <Table.Root>
        <Table.CardHead>
          <Loading.Skeleton className="h-[16px] w-32" />
          <Table.CardHead.Actions>
            <Loading.Skeleton className="h-[34px] w-70" />
            <Loading.Skeleton className="h-[34px] w-28" />
          </Table.CardHead.Actions>
        </Table.CardHead>
        <Table.Table>
          <Table.Body>
            <Table.Skeleton columns={6} rows={5} />
          </Table.Body>
        </Table.Table>
        <Table.Footer>
          <Loading.Skeleton className="h-[12px] w-40" />
          <Loading.Skeleton className="h-[28px] w-48" />
        </Table.Footer>
      </Table.Root>
    </div>
  );
}
