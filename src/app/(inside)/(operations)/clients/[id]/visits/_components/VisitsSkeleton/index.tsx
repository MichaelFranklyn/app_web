import { Table } from "@/components/Table";

/** Placeholder da aba "Visitas": as mesmas colunas da tabela real. */
export function VisitsSkeleton() {
  return (
    <Table.Root>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Data</Table.Head>
            <Table.Head>Por que ir</Table.Head>
            <Table.Head>Fábricas tratadas</Table.Head>
            <Table.Head>Responsável</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Resultado</Table.Head>
            <Table.Head>Motivo do resultado</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Skeleton columns={8} rows={6} />
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
