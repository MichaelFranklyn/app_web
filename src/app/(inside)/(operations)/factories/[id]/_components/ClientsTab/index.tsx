"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { Users } from "lucide-react";
import { FACTORY_CLIENT_COLUMN_HELP } from "../../../help";
import { DeleteClientLinkModal } from "./DeleteClientLinkModal";
import { EditClientLinkModal } from "./EditClientLinkModal";
import { FactoryClientLink } from "./gql";
import { LinkClientModal } from "./LinkClientModal";
import { useFactoryClientsTable } from "./useFactoryClientsTable";
import { priorityMeta } from "./utils";
import { clientName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";

interface Props {
  factoryId: string;
  companyFactoryId: string;
}

export function ClientsTab({ factoryId, companyFactoryId }: Props) {
  // Página, ordem e filtros resolvidos no BANCO — ver `useFactoryClientsTable`.
  const table = useFactoryClientsTable(factoryId, companyFactoryId);

  const optimistic = useOptimisticList<FactoryClientLink>({
    initialData: table.displayedData,
  });
  const links = optimistic.items;
  const { loading, error, refetch } = table;
  const isNarrowed = Object.values(table.inputValues).some(Boolean);

  return (
    <Table.Root sort={table.sort} data-tour="factory-clients-table">
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
        <Table.CardHead.Actions data-tour="factory-clients-actions">
          <Filters
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
            onTextChange={table.setFilter}
          />
          <LinkClientModal
            factoryId={factoryId}
            companyFactoryId={companyFactoryId}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            {/* Só duas colunas ordenam, e quem ordena é o banco. Vendedor e
                nível são UUID no vínculo; prioridade é texto ("alta", "baixa",
                "media"), cuja ordem alfabética não é a ordem que se lê. */}
            <Table.Head
              sortKey="client_name"
              title={FACTORY_CLIENT_COLUMN_HELP.client}
            >
              Cliente
            </Table.Head>
            <Table.Head title={FACTORY_CLIENT_COLUMN_HELP.seller}>
              Vendedor
            </Table.Head>
            <Table.Head title={FACTORY_CLIENT_COLUMN_HELP.priceTier}>
              Nível de preço
            </Table.Head>
            <Table.Head title={FACTORY_CLIENT_COLUMN_HELP.priority}>
              Prioridade
            </Table.Head>
            {/* Faturamento deste vínculo — não o do cliente somando fábricas. */}
            <Table.Head
              sortKey="last_invoice_date"
              sortFirst="desc"
              title={FACTORY_CLIENT_COLUMN_HELP.lastInvoice}
            >
              Faturamento
            </Table.Head>
            <Table.Head
              className="text-right"
              title={FACTORY_CLIENT_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && links.length === 0 ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : error && links.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : links.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  {/* "Não há vínculo" e "o filtro não achou" pedem saídas
                      diferentes: uma manda cadastrar, a outra manda afrouxar. */}
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente vinculado"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Ajuste os filtros para encontrar o cliente."
                      : 'Use "Vincular cliente" para conectar um cliente da sua carteira a esta fábrica.'}
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
                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {formatDate(link.lastInvoiceDate)}
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

      {/* Faltava: a aba mostrava 50 vínculos e nada dizia que havia mais. */}
      <Table.Footer>
        <Table.Footer.Info>
          {loading && links.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} cliente(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhum cliente encontrado"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          onPageChange={table.setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
