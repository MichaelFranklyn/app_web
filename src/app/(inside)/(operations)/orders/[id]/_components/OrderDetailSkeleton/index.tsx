import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";

const ITEM_ROWS = 5;

/** Placeholder do cabeçalho do pedido (breadcrumb + título + ações). */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-[8px]">
        <Loading.Skeleton className="h-[12px] w-16" />
        <Loading.Skeleton className="h-[12px] w-20" />
      </div>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[10px] w-24" />
            </PanelHeader.Eyebrow>
            <Loading.Skeleton className="h-[20px] w-72" />
            <Loading.Skeleton className="mt-[6px] h-[12px] w-56" />
            <PanelHeader.Actions className="mt-6">
              <Loading.Skeleton className="h-[22px] w-20 rounded-full" />
              <Loading.Skeleton className="h-[36px] w-28" />
              <Loading.Skeleton className="h-[36px] w-24" />
              <Loading.Skeleton className="h-[36px] w-24" />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}

/** Placeholder da tabela de itens do pedido. */
function ItemsTableSkeleton() {
  return (
    <Table.Root>
      <Table.CardHead>
        <Loading.Skeleton className="h-[16px] w-32" />
        <Loading.Skeleton className="h-[20px] w-16 rounded-full" />
      </Table.CardHead>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Produto</Table.Head>
            <Table.Head>Embalagem</Table.Head>
            <Table.Head>Tabela</Table.Head>
            <Table.Head>Qtd</Table.Head>
            <Table.Head>Preço unit.</Table.Head>
            <Table.Head>Desconto</Table.Head>
            <Table.Head>Subtotal</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Skeleton columns={7} rows={ITEM_ROWS} />
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}

/** Placeholder do card de resumo financeiro. */
function SummaryCardSkeleton() {
  return (
    <Card.Root>
      <Card.Header>
        <Loading.Skeleton className="h-[14px] w-32" />
      </Card.Header>
      <Card.Body padding="compact">
        <div className="flex items-center justify-between py-[8px]">
          <Loading.Skeleton className="h-[12px] w-24" />
          <Loading.Skeleton className="h-[14px] w-16" />
        </div>
        <Divider.Root className="my-2" />
        <div className="flex items-center justify-between py-[8px]">
          <Loading.Skeleton className="h-[12px] w-20" />
          <Loading.Skeleton className="h-[14px] w-16" />
        </div>
      </Card.Body>
    </Card.Root>
  );
}

export function OrderDetailSkeleton() {
  return (
    <PageContent>
      <HeaderSkeleton />

      <div className="flex gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <ItemsTableSkeleton />
        </div>
        <div className="flex w-[260px] shrink-0 flex-col gap-12">
          <SummaryCardSkeleton />
        </div>
      </div>
    </PageContent>
  );
}
