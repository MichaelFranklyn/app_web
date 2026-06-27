"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { DeleteClientLinkModal } from "./DeleteClientLinkModal";
import { EditClientLinkModal } from "./EditClientLinkModal";
import {
  FACTORY_CLIENT_LINKS_QUERY,
  FactoryClientLink,
  FactoryClientLinksData,
} from "./gql";
import { LinkClientModal } from "./LinkClientModal";
import { priorityMeta } from "./utils";
import { clientName } from "@/utils/company";

interface Props {
  factoryId: string;
  companyFactoryId: string;
}

export function ClientsTab({ factoryId, companyFactoryId }: Props) {
  const { data, loading } = useQuery<FactoryClientLinksData>(
    FACTORY_CLIENT_LINKS_QUERY,
    {
      variables: {
        input: {
          first: 50,
          filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
        },
      },
    }
  );

  const initialLinks = useMemo<FactoryClientLink[]>(
    () => data?.factory_client_links?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<FactoryClientLink>({
    initialData: initialLinks,
  });
  const links = optimistic.items;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Clientes da fábrica
          <HelpTooltip
            label="O que é vincular um cliente à fábrica?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Cliente da fábrica
                </Title>
                <Title variant="body-sm">
                  Diz quais clientes da sua carteira compram desta fábrica, por
                  qual vendedor e em qual nível de preço. Só clientes vinculados
                  aqui podem ter pedidos desta fábrica.
                </Title>
                <Title variant="body-sm" color="muted">
                  O nível de preço escolhido é usado como referência na
                  importação de pedidos do cliente.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <LinkClientModal
            factoryId={factoryId}
            companyFactoryId={companyFactoryId}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Nível de preço</Table.Head>
            <Table.Head>Prioridade</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && links.length === 0 ? (
            <Table.Skeleton columns={5} rows={5} />
          ) : links.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum cliente vinculado</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Vincular cliente&quot; para conectar um cliente da
                    sua carteira a esta fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            links.map((link) => {
              const priority = priorityMeta(link.priority);
              const name = clientName(link.client);
              return (
                <Table.Row key={link.id}>
                  <Table.Cell flex>
                    <Avatar
                      size="sm"
                      color="neutral"
                      initials={name.slice(0, 2).toUpperCase()}
                    />
                    <Table.CellText variant="strong">{name}</Table.CellText>
                  </Table.Cell>
                  <Table.Cell variant="dim">
                    {link.seller?.name ?? "—"}
                  </Table.Cell>
                  <Table.Cell>
                    {link.priceTier ? (
                      <Badge.Root color="subtle" appearance="tinted">
                        <Badge.Text>{link.priceTier.name}</Badge.Text>
                      </Badge.Root>
                    ) : (
                      <Table.CellText variant="dim">—</Table.CellText>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge.Root color={priority.color} appearance="tinted">
                      <Badge.Text>{priority.label}</Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-4">
                      <EditClientLinkModal
                        link={link}
                        companyFactoryId={companyFactoryId}
                        onUpdateOptimistic={optimistic.updateOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                      />
                      <DeleteClientLinkModal
                        linkId={link.id}
                        clientName={name}
                        onRemoveOptimistic={optimistic.removeOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
