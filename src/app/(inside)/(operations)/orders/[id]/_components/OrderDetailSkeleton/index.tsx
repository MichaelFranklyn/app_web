import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";
import { PAGE_HEADING } from "@/utils/modules";

const ITEM_ROWS = 5;

/** Placeholder do cabeçalho do pedido (breadcrumb + título + ações). */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-8">
        <Loading.Skeleton text="body-sm" className="w-16" />
        <Loading.Skeleton text="body-sm" className="w-20" />
      </div>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.HeadingSkeleton {...PAGE_HEADING.orders} />
            <Loading.Skeleton text="body-sm" className="mt-6 w-56" />
            <PanelHeader.Actions>
              <Loading.Skeleton shape="pill" className="h-[22px] w-20" />
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
        <Loading.Skeleton text="heading-sm" className="w-32" />
        <Loading.Skeleton shape="pill" className="h-[20px] w-16" />
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

/** Linhas sempre presentes no resumo: total, comissão, prazo e frete. */
const SUMMARY_ROWS = ["w-24", "w-20", "w-28", "w-16"];

/**
 * Placeholder do card de resumo financeiro — a mesma casca do
 * `OrderSummaryCard`: título no cabeçalho e linhas `Card.Item variant="stat"`,
 * que trazem o próprio separador.
 */
function SummaryCardSkeleton() {
  return (
    <Card.Root aria-hidden>
      <Card.Header>
        <Loading.Skeleton text="body-md" className="w-32" />
      </Card.Header>
      <Card.Body padding="compact" columns="wide">
        {SUMMARY_ROWS.map((width) => (
          <Card.Item key={width} variant="stat">
            <Loading.Skeleton text="body-sm" className={width} />
            <Loading.Skeleton text="body-sm" className="w-16" />
          </Card.Item>
        ))}
      </Card.Body>
    </Card.Root>
  );
}

export function OrderDetailSkeleton() {
  return (
    <PageContent>
      <HeaderSkeleton />

      {/* Mesma régua do `content.tsx`: abaixo do desktop-xl, resumo em cima. */}
      <div className="desktop-xl:flex-row flex flex-col gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <ItemsTableSkeleton />
        </div>
        <div className="desktop-xl:w-[320px] max-desktop-xl:order-first flex w-full shrink-0 flex-col gap-12">
          <SummaryCardSkeleton />
        </div>
      </div>
    </PageContent>
  );
}
