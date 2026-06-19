"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { formatDateDMY } from "@/utils/format/masks";
import { Building2 } from "lucide-react";
import { AccessRowActions } from "./AccessRowActions";
import { AddAccessModal } from "./AddAccessModal";
import { SELLER_FACTORY_ACCESS_LIST_QUERY } from "./gql";
import { QueryData, SellerFactoryAccess } from "./interface";

export default function SellerAccessContent() {
  const tableData = useTableData<QueryData, SellerFactoryAccess>({
    query: SELLER_FACTORY_ACCESS_LIST_QUERY,
    fields: {},
    getConnection: (data) => data.seller_factory_access_list,
    itemsPerPage: 10,
  });

  const optimistic = useOptimisticList<SellerFactoryAccess>({
    initialData: tableData.displayedData,
  });

  const isEmpty = !tableData.loading && optimistic.items.length === 0;

  return (
    <Tabs.Content value="acessos">
      <div className="mt-16">
        <Table.Root>
          <Table.CardHead>
            <Table.CardHead.Title>Acessos por Fábrica</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <div className="flex items-center gap-8">
                <InputSearch
                  placeholder="Buscar por nome..."
                  value={tableData.inputValues.search ?? ""}
                  onChange={(e) =>
                    tableData.setFilter("search", e.target.value || undefined)
                  }
                />
                <AddAccessModal />
              </div>
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Vendedor</Table.Head>
                <Table.Head>Fábrica</Table.Head>
                <Table.Head>Concedido por</Table.Head>
                <Table.Head>Data</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableData.loading && optimistic.items.length === 0 ? (
                <Table.Skeleton columns={6} rows={5} />
              ) : isEmpty ? (
                <Table.Row>
                  <Table.Cell colSpan={6}>
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <Building2 size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        Nenhum acesso encontrado
                      </EmptyState.Title>
                      <EmptyState.Description>
                        Adicione um acesso para vincular um vendedor a uma
                        fábrica.
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
                        {node.factory?.nomeFantasia ??
                          node.factory?.razaoSocial ??
                          "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {node.grantedByUser?.name ?? "-"}
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
                        factoryName={
                          node.factory?.nomeFantasia ??
                          node.factory?.razaoSocial ??
                          ""
                        }
                        isActive={node.isActive}
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
