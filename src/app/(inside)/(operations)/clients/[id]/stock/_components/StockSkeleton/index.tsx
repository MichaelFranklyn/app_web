import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";

/**
 * Placeholder da aba "Estoque": select de vínculo + alerta informativa
 * + tabela de insights de produto.
 */
export function StockSkeleton() {
  return (
    <>
      <Loading.Skeleton className="mb-16 h-[40px] w-full" />

      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Produto</Table.Head>
              <Table.Head>Última compra</Table.Head>
              <Table.Head>Qtd. comprada</Table.Head>
              <Table.Head>Avg. duração</Table.Head>
              <Table.Head>Esgotamento est.</Table.Head>
              <Table.Head>Dias até esgotar</Table.Head>
              <Table.Head>Situação</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Skeleton columns={7} rows={6} />
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </>
  );
}
