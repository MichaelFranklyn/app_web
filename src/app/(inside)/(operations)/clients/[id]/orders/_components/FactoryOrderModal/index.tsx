"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch, InputSelect } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/utils/format/date";
import { pageToAfter } from "@/utils/pagination";
import { EditOrderModal } from "../../../../../_components/EditOrderModal";
import { UPDATE_ORDER_FROM_CLIENT_MUTATION } from "../../../../../_components/EditOrderModal";
import { CLIENT_ORDERS_QUERY } from "../../../gql";
import {
  ClientOrder,
  ClientOrdersQueryResponse,
  FactoryOrderSummary,
} from "../../../interface";
import {
  formatCurrency,
  orderStatusColor,
  orderStatusLabel,
} from "../../../utils";
import { DeleteOrderModal } from "../DeleteOrderModal";
import { factoryName } from "@/utils/company";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "enviado", label: "Enviado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
  { value: "rascunho", label: "Rascunho" },
];

interface Props {
  summary: FactoryOrderSummary | null;
  clientId: string;
  onClose: () => void;
}

/**
 * Pedidos do cliente NAQUELA fábrica, para aquele vendedor.
 *
 * O recorte é o vínculo (vendedor × cliente × fábrica), o mesmo que sustenta o
 * card: um gestor que vê dois vendedores atendendo a mesma fábrica vê dois cards,
 * e cada um abre só os seus pedidos.
 */
export function FactoryOrderModal({ summary, clientId, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);
  const [page, setPage] = useState(1);

  const factoryId = summary?.factory?.id ?? null;
  const sellerId = summary?.sellerId ?? null;

  const variables = useMemo(
    () => ({
      input: {
        first: ITEMS_PER_PAGE,
        after: pageToAfter(page, ITEMS_PER_PAGE),
        order: { by: "order_date", dir: "desc" },
        filters: [
          { field: "client_id", operator: "eq", value: clientId },
          { field: "factory_id", operator: "eq", value: factoryId },
          { field: "seller_id", operator: "eq", value: sellerId },
          ...(statusFilter
            ? [{ field: "status", operator: "eq", value: statusFilter.value }]
            : []),
          ...(search.trim()
            ? [{ field: "search", operator: "like", value: search.trim() }]
            : []),
        ],
      },
    }),
    [clientId, factoryId, sellerId, page, search, statusFilter]
  );

  // Só busca quando o modal abre: um cliente tem dezenas de fábricas e carregar
  // os pedidos de todas ao abrir a aba seria desperdício.
  const { data, loading, refetch } = useQuery<ClientOrdersQueryResponse>(
    CLIENT_ORDERS_QUERY,
    { variables, skip: !factoryId }
  );

  const initialOrders = useMemo<ClientOrder[]>(
    () => data?.orders.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<ClientOrder>({
    initialData: initialOrders,
  });
  const orders = optimistic.items;
  const totalCount = data?.orders.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const hasFilters = search.trim() !== "" || statusFilter !== null;

  if (!summary) return null;

  const name = factoryName(summary.factory);

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content size="5xl">
        <Modal.Header
          title={`Pedidos — ${name}`}
          description="Histórico de compra do cliente nesta fábrica."
        />
        <Modal.Body>
          <div className="mb-12 flex items-center gap-8">
            <InputSearch
              size="sm"
              containerClassName="w-72"
              placeholder="Buscar por vendedor ou código..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <InputSelect
              size="sm"
              placeholder="Todos os status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val as SelectOption | null);
                setPage(1);
              }}
              containerClassName="w-[160px]"
            />
          </div>

          <Table.Root>
            <Table.Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Pedido</Table.Head>
                  <Table.Head>Vendedor</Table.Head>
                  <Table.Head>Data</Table.Head>
                  <Table.Head>Valor</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Ações</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading && orders.length === 0 ? (
                  <Table.Skeleton columns={6} rows={5} />
                ) : orders.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6}>
                      <EmptyState.Root>
                        <EmptyState.Icon>
                          <Receipt size={32} />
                        </EmptyState.Icon>
                        <EmptyState.Title>
                          {hasFilters
                            ? "Nenhum pedido encontrado"
                            : "Nenhum pedido nesta fábrica"}
                        </EmptyState.Title>
                        <EmptyState.Description>
                          {hasFilters
                            ? "Ajuste a busca ou os filtros."
                            : "Este cliente ainda não comprou desta fábrica."}
                        </EmptyState.Description>
                      </EmptyState.Root>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  orders.map((p) => (
                    <Table.Row
                      key={p.id}
                      className="group"
                      href={`/orders/${p.id}`}
                    >
                      <Table.Cell>
                        <Badge.Root color="neutral" appearance="tinted">
                          <Badge.Text>
                            {p.id.slice(0, 8).toUpperCase()}
                          </Badge.Text>
                        </Badge.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <Table.CellText variant="dim">
                          {p.seller?.name ?? "—"}
                        </Table.CellText>
                      </Table.Cell>
                      <Table.Cell>
                        <Table.CellText variant="dim">
                          {formatDate(p.orderDate)}
                        </Table.CellText>
                      </Table.Cell>
                      <Table.Cell>
                        <Table.CellText variant="strong">
                          {formatCurrency(p.totalAmount)}
                        </Table.CellText>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge.Root
                          color={orderStatusColor(p.status)}
                          appearance="tinted"
                        >
                          <Badge.Text>{orderStatusLabel(p.status)}</Badge.Text>
                        </Badge.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-2">
                          <EditOrderModal
                            orderId={p.id}
                            initialNotes={p.notes}
                            mutation={UPDATE_ORDER_FROM_CLIENT_MUTATION}
                            invalidateKeys={["orders", "companyClient"]}
                          />
                          <DeleteOrderModal
                            orderId={p.id}
                            orderCode={p.id.slice(0, 8).toUpperCase()}
                            onDeleted={() => refetch()}
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
            <Table.Footer>
              <Table.Footer.Info>
                {totalCount > 0
                  ? `${totalCount} pedido(s) · página ${currentPage} de ${totalPages}`
                  : "Nenhum pedido"}
              </Table.Footer.Info>
              <Pagination.Smart
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </Table.Footer>
          </Table.Root>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
