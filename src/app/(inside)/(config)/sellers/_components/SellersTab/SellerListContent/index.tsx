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
import { formatDateDMY, formatMoney, maskPhoneBR } from "@/utils/format/masks";
import { Users } from "lucide-react";
import { AddSellerModal } from "./AddSellerModal";
import { SellerRowActions } from "./SellerRowActions";
import { SELLERS_QUERY } from "./gql";
import { QueryData, Seller } from "./interface";

export default function SellerListContent() {
  const tableData = useTableData<QueryData, Seller>({
    query: SELLERS_QUERY,
    fields: {
      search: { type: "text", queryField: "name" },
    },
    getConnection: (data) => data.sellers_list,
    itemsPerPage: 10,
  });

  const optimistic = useOptimisticList<Seller>({
    initialData: tableData.displayedData,
  });

  const isEmpty = !tableData.loading && optimistic.items.length === 0;

  return (
    <Tabs.Content value="lista">
      <div className="mt-16">
        <Table.Root>
          <Table.CardHead>
            <Table.CardHead.Title>Vendedores cadastrados</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <div className="flex items-center gap-8">
                <InputSearch
                  placeholder="Buscar por nome..."
                  value={tableData.inputValues.search ?? ""}
                  onChange={(e) =>
                    tableData.setFilter("search", e.target.value || undefined)
                  }
                />
                <AddSellerModal onAddOptimistic={optimistic.addOptimistic} />
              </div>
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Vendedor</Table.Head>
                <Table.Head>Região</Table.Head>
                <Table.Head>Fábricas</Table.Head>
                <Table.Head>Clientes</Table.Head>
                <Table.Head>Faturamento</Table.Head>
                <Table.Head>Último pedido</Table.Head>
                <Table.Head />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableData.loading && optimistic.items.length === 0 ? (
                <Table.Skeleton columns={7} rows={5} />
              ) : isEmpty ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <Users size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        Nenhum vendedor encontrado
                      </EmptyState.Title>
                      <EmptyState.Description>
                        Cadastre um novo vendedor ou ajuste os filtros de busca.
                      </EmptyState.Description>
                    </EmptyState.Root>
                  </Table.Cell>
                </Table.Row>
              ) : (
                optimistic.items.map((node) => (
                  <Table.Row
                    key={node.id}
                    className="group"
                    href={`/sellers/${node.id}`}
                  >
                    <Table.Cell flex>
                      <Avatar
                        size="md"
                        color="neutral"
                        initials={node.name.slice(0, 2).toUpperCase()}
                      />
                      <div className="flex flex-col gap-2">
                        <Table.CellText variant="strong">
                          {node.name}
                        </Table.CellText>
                        <Table.CellText variant="dim">
                          {node.phone ? maskPhoneBR(node.phone) : ""}
                        </Table.CellText>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {node.region || "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {node.factoryCount || "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {node.clientCount || "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {node.totalRevenue
                          ? formatMoney(node.totalRevenue)
                          : "-"}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {formatDateDMY(node.lastOrderDate)}
                      </Table.CellText>
                    </Table.Cell>

                    <Table.Cell flex className="justify-end">
                      {node.isActive ? (
                        <Badge.Root color="green" appearance="tinted">
                          <Badge.Text>Ativo</Badge.Text>
                        </Badge.Root>
                      ) : (
                        <Badge.Root color="red" appearance="tinted">
                          <Badge.Text>Inativo</Badge.Text>
                        </Badge.Root>
                      )}

                      <SellerRowActions
                        seller={node}
                        onUpdate={(data) =>
                          optimistic.updateOptimistic(node.id, data)
                        }
                        onToggle={() =>
                          optimistic.updateOptimistic(node.id, {
                            isActive: !node.isActive,
                          })
                        }
                        onRemove={() => optimistic.removeOptimistic(node.id)}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
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
                ? `${tableData.totalItems} vendedores · página ${tableData.currentPage} de ${tableData.totalPages}`
                : "Nenhum vendedor encontrado"}
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
