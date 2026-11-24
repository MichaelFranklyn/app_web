import { PortalPageHeader } from "../_components/PortalPageHeader";
import { Table } from "@/components/Table";
import { STOCK_PAGE_DESCRIPTION } from "./utils";

/**
 * O esqueleto da tabela de estoque — dez linhas, a página cheia de
 * `content.tsx`: com duas ou três, o cliente lê "acabou" e sai antes de a
 * lista chegar.
 */
export default function PortalStockLoading() {
  return (
    <div className="flex flex-col gap-20">
      <PortalPageHeader
        heading="product"
        title="Meu estoque"
        description={STOCK_PAGE_DESCRIPTION}
      />
      <Table.Root>
        <Table.Table>
          <Table.Body>
            <Table.Skeleton columns={4} rows={10} />
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </div>
  );
}
