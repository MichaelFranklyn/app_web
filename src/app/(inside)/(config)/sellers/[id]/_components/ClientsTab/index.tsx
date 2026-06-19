"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { formatDateDMY } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { SELLER_CLIENTS_QUERY } from "./gql";

interface ClientNode {
  id: string;
  priority: string | null;
  visitFrequencyDays: number | null;
  lastVisitDate: string | null;
  createdAt: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

interface QueryResponse {
  seller_clients: {
    edges: { node: ClientNode }[];
    totalCount: number;
  };
}

interface Props {
  sellerId: string;
}

export function ClientsTab({ sellerId }: Props) {
  const { data, loading } = useQuery<QueryResponse>(SELLER_CLIENTS_QUERY, {
    variables: {
      input: {
        first: 50,
        filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
      },
    },
  });

  const items = data?.seller_clients?.edges?.map((e) => e.node) ?? [];
  const total = data?.seller_clients?.totalCount ?? 0;

  return (
    <Tabs.Content value="clientes">
      <div className="mt-16">
        <Table.Root>
          <Table.CardHead>
            <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Badge.Root color="neutral" appearance="tinted">
                <Badge.Text>{total} clientes</Badge.Text>
              </Badge.Root>
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Cliente</Table.Head>
                <Table.Head>Fábrica</Table.Head>
                <Table.Head>Prioridade</Table.Head>
                <Table.Head>Frequência de visita</Table.Head>
                <Table.Head>Última visita</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading && items.length === 0 ? (
                <Table.Skeleton columns={5} rows={5} />
              ) : items.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <div className="py-16 text-center text-(--fg-muted) text-sm">
                      Nenhum cliente atribuído
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                items.map((node) => (
                  <Table.Row key={node.id}>
                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {node.client?.nomeFantasia ?? node.client?.razaoSocial ?? "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {node.factory?.nomeFantasia ?? node.factory?.razaoSocial ?? "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      {node.priority ? (
                        <Badge.Root color="neutral" appearance="tinted">
                          <Badge.Text>{node.priority}</Badge.Text>
                        </Badge.Root>
                      ) : (
                        <Table.CellText variant="dim">—</Table.CellText>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {node.visitFrequencyDays
                          ? `A cada ${node.visitFrequencyDays} dias`
                          : "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {formatDateDMY(node.lastVisitDate ?? undefined)}
                      </Table.CellText>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Table>
        </Table.Root>
      </div>
    </Tabs.Content>
  );
}
