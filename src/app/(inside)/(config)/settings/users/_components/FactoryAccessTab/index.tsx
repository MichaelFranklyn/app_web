"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { formatDateDMY } from "@/utils/format/masks";
import { Building2 } from "lucide-react";
import { ACCESS_COLUMN_HELP, ACCESS_HELP } from "../../help";
import { AccessRowActions } from "./AccessRowActions";
import { sellerAgreementLabel } from "./utils";
import { AddAccessModal } from "./AddAccessModal";
import { SELLER_FACTORY_ACCESS_LIST_QUERY } from "./gql";
import { QueryData, SellerFactoryAccess } from "./interface";
import {
  ACCESS_SORTABLE_FIELDS,
  ACCESS_TABLE_FIELDS,
  useAccessFilters,
} from "./useAccessFilters";
import { factoryName } from "@/utils/company";

export function FactoryAccessTab() {
  const tableData = useTableData<QueryData, SellerFactoryAccess>({
    query: SELLER_FACTORY_ACCESS_LIST_QUERY,
    fields: ACCESS_TABLE_FIELDS,
    getConnection: (data) => data.seller_factory_access_list,
    itemsPerPage: 10,
    sortableFields: ACCESS_SORTABLE_FIELDS,
    // O `ListUseCase` ordena por `created_at desc` quando ninguém pede nada.
    backendDefaultSort: { key: "created_at", direction: "desc" },
  });

  const filterFields = useAccessFilters();

  const optimistic = useOptimisticList<SellerFactoryAccess>({
    initialData: tableData.displayedData,
  });

  const isEmpty = !tableData.loading && optimistic.items.length === 0;

  return (
    <Tabs.Content value="acessos">
      <div className="mt-16">
        <Table.Root sort={tableData.sort}>
          <Table.CardHead>
            <Table.CardHead.Title className="inline-flex items-center gap-6">
              Acessos por Fábrica
              <HelpTooltip
                label="O que é um acesso por fábrica?"
                content={ACCESS_HELP}
              />
            </Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Filters
                fields={filterFields}
                values={tableData.inputValues}
                onChange={tableData.setFilters}
              />
              <AddAccessModal onAddOptimistic={optimistic.addOptimistic} />
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                {/* Vendedor, fábrica e quem concedeu vêm de tabelas vizinhas:
                    dá para FILTRAR por id, mas não ordenar pelo nome. */}
                <Table.Head title={ACCESS_COLUMN_HELP.seller}>
                  Vendedor
                </Table.Head>
                <Table.Head title={ACCESS_COLUMN_HELP.factory}>
                  Fábrica
                </Table.Head>
                <Table.Head title={ACCESS_COLUMN_HELP.grantedBy}>
                  Concedido por
                </Table.Head>
                <Table.Head title={ACCESS_COLUMN_HELP.commission}>
                  Comissão do vendedor
                </Table.Head>
                <Table.Head
                  sortKey="created_at"
                  sortFirst="desc"
                  title={ACCESS_COLUMN_HELP.date}
                >
                  Data
                </Table.Head>
                <Table.Head
                  sortKey="is_active"
                  title={ACCESS_COLUMN_HELP.status}
                >
                  Status
                </Table.Head>
                <Table.Head title={ACCESS_COLUMN_HELP.actions} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableData.loading && optimistic.items.length === 0 ? (
                <Table.Skeleton columns={7} rows={5} />
              ) : tableData.error && optimistic.items.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <QueryError flat onRetry={() => tableData.refetch()} />
                  </Table.Cell>
                </Table.Row>
              ) : isEmpty ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <Building2 size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        Nenhum acesso encontrado
                      </EmptyState.Title>
                      <EmptyState.Description>
                        {Object.values(tableData.inputValues).some(Boolean)
                          ? "Ajuste os filtros para encontrar o acesso."
                          : "Adicione um acesso para vincular um vendedor a uma fábrica."}
                      </EmptyState.Description>
                    </EmptyState.Root>
                  </Table.Cell>
                </Table.Row>
              ) : (
                optimistic.items.map((node) => (
                  <Table.Row key={node.id} className="group">
                    <Table.Cell flex>
                      <Avatar
                        size="sm"
                        color="neutral"
                        initials={(node.seller?.name ?? "-")
                          .slice(0, 2)
                          .toUpperCase()}
                      />
                      <Table.CellText variant="strong">
                        {node.seller?.name ?? "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {factoryName(node.factory) ?? "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {node.grantedByUser?.name ?? "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {sellerAgreementLabel(
                          node.sellerCommissionRate,
                          node.sellerCommissionBasis
                        )}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {formatDateDMY(node.createdAt)}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      {node.isActive ? (
                        <Badge.Root color="green" appearance="tinted">
                          <Badge.Text>Ativo</Badge.Text>
                        </Badge.Root>
                      ) : (
                        <Badge.Root color="red" appearance="tinted">
                          <Badge.Text>Inativo</Badge.Text>
                        </Badge.Root>
                      )}
                    </Table.Cell>

                    <Table.Cell flex className="justify-end">
                      <AccessRowActions
                        id={node.id}
                        sellerName={node.seller?.name ?? ""}
                        sellerIsActive={node.seller?.isActive ?? true}
                        factoryName={factoryName(node.factory) ?? ""}
                        factoryId={node.factory?.id ?? ""}
                        isActive={node.isActive}
                        sellerCommissionRate={node.sellerCommissionRate}
                        sellerCommissionBasis={node.sellerCommissionBasis}
                        onAgreementSaved={() => tableData.refetch()}
                        onRevoke={() =>
                          optimistic.updateOptimistic(node.id, {
                            isActive: !node.isActive,
                          })
                        }
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                        onRemove={() => optimistic.removeOptimistic(node.id)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Table>

          <Table.Footer>
            <Table.Footer.Info>
              {tableData.loading && optimistic.items.length > 0 && (
                <Loading.Spinner size="sm" className="mr-6 inline-block" />
              )}
              {tableData.totalItems > 0
                ? `${tableData.totalItems} acessos · página ${tableData.currentPage} de ${tableData.totalPages}`
                : "Nenhum acesso encontrado"}
            </Table.Footer.Info>

            <Pagination.Smart
              currentPage={tableData.currentPage}
              totalPages={tableData.totalPages}
              onPageChange={tableData.setCurrentPage}
            />
          </Table.Footer>
        </Table.Root>
      </div>
    </Tabs.Content>
  );
}
