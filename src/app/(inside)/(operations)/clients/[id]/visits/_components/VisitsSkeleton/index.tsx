import { Table } from "@/components/Table";

/** Placeholder da aba "Visitas": tabela de visitas. */
export function VisitsSkeleton() {
  return (
    <Table.Root>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Data</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Resultado</Table.Head>
            <Table.Head>Motivo</Table.Head>
            <Table.Head>Obs. Estoque</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Skeleton columns={7} rows={6} />
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
