"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch, InputSelect } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Receipt } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CLIENT_ORDERS_QUERY } from "../gql";
import { ClientOrder, ClientOrdersQueryResponse } from "../interface";
import { formatCurrency, orderStatusColor, orderStatusLabel } from "../utils";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { pageToAfter } from "@/utils/pagination";
import { EditOrderModal } from "../../../orders/_components/EditOrderModal";
import { UPDATE_ORDER_FROM_CLIENT_MUTATION } from "../../../orders/_components/EditOrderModal/gql";
import { AddOrderModal } from "./_components/AddOrderModal";
import { DeleteOrderModal } from "./_components/DeleteOrderModal";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "enviado", label: "Enviado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
  { value: "rascunho", label: "Rascunho" },
];

export default function OrdersContent() {
  const params = useParams();
  const id = params.id as string;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);
  const [page, setPage] = useState(1);

  const variables = useMemo(
    () => ({
      input: {
        first: ITEMS_PER_PAGE,
        after: pageToAfter(page, ITEMS_PER_PAGE),
        order: { by: "order_date", dir: "desc" },
        filters: [
          { field: "client_id", operator: "eq", value: id },
          ...(statusFilter
            ? [{ field: "status", operator: "eq", value: statusFilter.value }]
            : []),
          ...(search.trim()
            ? [{ field: "search", operator: "like", value: search.trim() }]
            : []),
        ],
      },
    }),
    [id, page, search, statusFilter]
  );

  const { data, loading, refetch } = useQuery<ClientOrdersQueryResponse>(
    CLIENT_ORDERS_QUERY,
    { variables, skip: !id }
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

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (val: SelectOption | null) => {
    setStatusFilter(val);
    setPage(1);
  };

  const hasFilters = search.trim() !== "" || statusFilter !== null;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title size="sm" weight="semibold">
          Pedidos
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <div className="flex items-center gap-8">
            <InputSearch
              containerClassName="w-72"
              placeholder="Buscar por fábrica, vendedor ou código..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <InputSelect
              placeholder="Todos os status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => handleStatus(val as SelectOption | null)}
              containerClassName="w-[160px]"
            />
            <AddOrderModal clientId={id} onCreated={() => refetch()} />
          </div>
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Pedido</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Data</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && orders.length === 0 ? (
            <Table.Skeleton columns={7} rows={5} />
          ) : orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={7}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {hasFilters
                      ? "Nenhum pedido encontrado"
                      : "Nenhum pedido cadastrado"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {hasFilters
                      ? "Ajuste a busca ou os filtros."
                      : 'Use "Pedido" para registrar o primeiro pedido deste cliente.'}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            orders.map((p) => (
              <Table.Row key={p.id} className="group" href={`/orders/${p.id}`}>
                <Table.Cell>
                  <Badge.Root color="neutral" appearance="tinted">
                    <Badge.Text>{p.id.slice(0, 8).toUpperCase()}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {factoryName(p.factory)}
                  </Table.CellText>
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
                      invalidateKeys={["orders"]}
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
          {loading && orders.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalCount > 0
            ? `${totalCount} pedido(s) · página ${currentPage} de ${totalPages}`
            : "Nenhum pedido encontrado"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
