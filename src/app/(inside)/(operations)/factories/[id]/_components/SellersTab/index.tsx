"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { AddSellerAccessModal } from "./AddSellerAccessModal";
import { DeleteSellerAccessModal } from "./DeleteSellerAccessModal";
import { EditSellerAccessModal } from "./EditSellerAccessModal";
import { FACTORY_SELLER_ACCESSES_QUERY } from "./gql";

interface SellerAccess {
  id: string;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    isActive: boolean;
    region: string | null;
    clientCount: number;
    factoryCount: number;
    totalRevenue: string;
  } | null;
  grantedByUser: { id: string; name: string } | null;
}

interface SellersQueryData {
  factory_seller_accesses: {
    edges: { node: SellerAccess }[];
    totalCount: number;
  };
}

interface Props {
  factoryId: string;
}

export function SellersTab({ factoryId }: Props) {
  const { data, loading } = useQuery<SellersQueryData>(
    FACTORY_SELLER_ACCESSES_QUERY,
    {
      variables: {
        input: {
          first: 50,
          filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
        },
      },
    }
  );

  const initialAccesses = useMemo<SellerAccess[]>(
    () => data?.factory_seller_accesses?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<SellerAccess>({
    initialData: initialAccesses,
  });
  const accesses = optimistic.items;

  return (
    <Table.Root data-tour="factory-sellers-table">
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Acesso de vendedores
          <HelpTooltip
            label="O que é o acesso de vendedor?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Acesso de vendedor
                </Title>
                <Title variant="body-sm">
                  Diz quais vendedores podem vender os produtos desta fábrica.
                  Só vendedores com acesso <b>ativo</b> aparecem na hora de
                  vincular clientes e registrar pedidos dela.
                </Title>
                <Title variant="body-sm" color="muted">
                  <b>Desativar</b> pausa as vendas e pode ser desfeito quando
                  quiser. <b>Excluir</b> tira o vendedor desta lista. Nos dois
                  casos os pedidos já feitos continuam guardados.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions data-tour="factory-sellers-actions">
          <AddSellerAccessModal factoryId={factoryId} />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Região</Table.Head>
            <Table.Head>Clientes</Table.Head>
            <Table.Head>Faturamento</Table.Head>
            <Table.Head>Acesso</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && accesses.length === 0 ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : accesses.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum vendedor com acesso
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Conceder acesso&quot; para vincular um vendedor a
                    esta fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            accesses.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell flex>
                  <Avatar
                    size="sm"
                    color="neutral"
                    initials={(a.seller?.name ?? "?").slice(0, 2).toUpperCase()}
                  />
                  <Table.CellText variant="strong">
                    {a.seller?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell variant="dim">{a.seller?.region ?? "—"}</Table.Cell>
                <Table.Cell variant="strong">
                  {a.seller?.clientCount ?? "—"}
                </Table.Cell>
                <Table.Cell variant="strong">
                  {a.seller?.totalRevenue
                    ? formatMoney(a.seller.totalRevenue)
                    : "—"}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={a.isActive ? "green" : "neutral"}
                    appearance="tinted"
                  >
                    <Badge.Text>{a.isActive ? "Ativo" : "Inativo"}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    {a.seller && (
                      <EditSellerAccessModal
                        accessId={a.id}
                        sellerName={a.seller.name}
                        isActive={a.isActive}
                        sellerIsActive={a.seller.isActive}
                        onUpdateOptimistic={optimistic.updateOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                      />
                    )}
                    <DeleteSellerAccessModal
                      accessId={a.id}
                      sellerName={a.seller?.name ?? "este vendedor"}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
