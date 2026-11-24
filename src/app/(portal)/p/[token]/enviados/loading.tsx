import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";
import { PAGE_HEADING } from "@/utils/modules";
import { SentOrdersKpisSkeleton } from "./_components/SentOrdersKpis";

/** Limite próprio: sem ele, quem abre a lista veria o esqueleto de "Resumo". */
export default function PortalSentOrdersLoading() {
  return (
    <>
      <PanelHeader.HeadingSkeleton
        {...PAGE_HEADING.orders}
        barClassName="w-[120px]"
      />
      <SentOrdersKpisSkeleton />
      <Table.Root>
        <div className="flex flex-col gap-8 p-16">
          <Loading.Skeleton text="heading-sm" className="w-[120px]" />
          <Loading.Skeleton text="body-sm" className="w-[240px]" />
        </div>
        <Table.Table>
          <Table.Body>
            <Table.Skeleton columns={5} rows={10} />
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </>
  );
}
