"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { formatDateDMY } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { SELLER_FACTORY_ACCESSES_QUERY } from "./gql";

interface FactoryAccessNode {
  id: string;
  isActive: boolean;
  createdAt: string;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  grantedByUser: {
    id: string;
    name: string;
  } | null;
}

interface QueryResponse {
  seller_accesses: {
    edges: { node: FactoryAccessNode }[];
    totalCount: number;
  };
}

interface Props {
  sellerId: string;
}

export function FactoriesTab({ sellerId }: Props) {
  const { data, loading } = useQuery<QueryResponse>(SELLER_FACTORY_ACCESSES_QUERY, {
    variables: {
      input: {
        first: 50,
        filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
      },
    },
  });

  const items = data?.seller_accesses?.edges?.map((e) => e.node) ?? [];
  const total = data?.seller_accesses?.totalCount ?? 0;

  return (
    <Tabs.Content value="fabricas">
      <div className="mt-16">
        <Table.Root>
          <Table.CardHead>
            <Table.CardHead.Title>Fábricas com acesso</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Badge.Root color="neutral" appearance="tinted">
                <Badge.Text>{total} fábricas</Badge.Text>
              </Badge.Root>
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Fábrica</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Concedido por</Table.Head>
                <Table.Head>Data</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading && items.length === 0 ? (
                <Table.Skeleton columns={4} rows={5} />
              ) : items.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <div className="py-16 text-center text-(--fg-muted) text-sm">
                      Nenhuma fábrica vinculada
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                items.map((node) => (
                  <Table.Row key={node.id}>
                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {node.factory?.nomeFantasia ?? node.factory?.razaoSocial ?? "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge.Root
                        color={node.isActive ? "green" : "red"}
                        appearance="tinted"
                      >
                        <Badge.Text>{node.isActive ? "Ativo" : "Inativo"}</Badge.Text>
                      </Badge.Root>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {node.grantedByUser?.name ?? "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {formatDateDMY(node.createdAt)}
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
