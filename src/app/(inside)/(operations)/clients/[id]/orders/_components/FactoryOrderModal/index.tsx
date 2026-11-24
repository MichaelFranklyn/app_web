"use client";

import { canDeleteOrder } from "@/app/(inside)/_shared/orderStatus";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch, InputSelect } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { CLIENT_ORDER_COLUMN_HELP } from "../../../../help";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/utils/format/date";
import { pageToAfter } from "@/utils/pagination";
import { CLIENT_ORDERS_QUERY } from "../../../gql";
import {
  ClientOrder,
  ClientOrdersQueryResponse,
  FactoryOrderSummary,
} from "../../../interface";
import { formatCurrency } from "../../../utils";
import {
  ORDER_STATUS_OPTIONS,
  orderStatusLabel,
  orderStatusTone,
} from "../../../../../../_shared/orderStatus";
import { OrderRowActions } from "../OrderRowActions";
import { factoryName } from "@/utils/company";
import { formatOrderNumber } from "@/utils/orderNumber";
import { plural } from "@/utils/format/plural";

const ITEMS_PER_PAGE = 10;

interface Props {
  summary: FactoryOrderSummary | null;
  clientId: string;
  onClose: () => void;
  /**
   * Pedido a editar. Quem trata é a PÁGINA, não este modal: abrir a edição aqui
   * empilhava dois modais (o de pedidos e o de edição), e o usuário não sabia
   * qual estava fechando. A página fecha este e abre a edição no lugar.
   */
  onEditOrder: (order: ClientOrder) => void;
}

/**
 * Pedidos do cliente NAQUELA fábrica — todos, independente de quem vendeu.
 *
 * O recorte é cliente × fábrica, não o vendedor do vínculo: o histórico de
 * compra é do cliente naquela fábrica e continua valendo quando a carteira
 * troca de dono. Filtrar pelo vendedor do vínculo escondia tudo o que o
 * vendedor anterior tinha vendido (o card zerava depois da transferência).
 * A coluna "Vendedor" da tabela mostra de quem é cada pedido.
 */
export function FactoryOrderModal({
  summary,
  clientId,
  onClose,
  onEditOrder,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);
  const [page, setPage] = useState(1);

  const factoryId = summary?.factory?.id ?? null;

  const variables = useMemo(
    () => ({
      input: {
        first: ITEMS_PER_PAGE,
        after: pageToAfter(page, ITEMS_PER_PAGE),
        order: { by: "order_date", dir: "desc" },
        filters: [
          { field: "client_id", operator: "eq", value: clientId },
          { field: "factory_id", operator: "eq", value: factoryId },
          ...(statusFilter
            ? [{ field: "status", operator: "eq", value: statusFilter.value }]
            : []),
          ...(search.trim()
            ? [{ field: "search", operator: "like", value: search.trim() }]
            : []),
        ],
      },
    }),
    [clientId, factoryId, page, search, statusFilter]
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
          <div className="mb-12 flex flex-wrap items-center gap-8">
            <InputSearch
              size="sm"
              containerClassName="w-72 max-tablet:w-full"
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
              options={ORDER_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val as SelectOption | null);
                setPage(1);
              }}
              containerClassName="w-[160px] max-tablet:w-full"
            />
          </div>

          <Table.Root>
            <Table.Table cards>
              <Table.Header>
                <Table.Row>
                  <Table.Head title={CLIENT_ORDER_COLUMN_HELP.code}>
                    Pedido
                  </Table.Head>
                  <Table.Head title={CLIENT_ORDER_COLUMN_HELP.seller}>
                    Vendedor
                  </Table.Head>
                  <Table.Head title={CLIENT_ORDER_COLUMN_HELP.date}>
                    Data
                  </Table.Head>
                  <Table.Head
                    align="right"
                    title={CLIENT_ORDER_COLUMN_HELP.amount}
                  >
                    Valor
                  </Table.Head>
                  <Table.Head title={CLIENT_ORDER_COLUMN_HELP.status}>
                    Status
                  </Table.Head>
                  <Table.Head
                    className="text-right"
                    title={CLIENT_ORDER_COLUMN_HELP.actions}
                  >
                    Ações
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading && orders.length === 0 ? (
                  <Table.Skeleton columns={6} rows={5} />
                ) : orders.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6}>
                      <EmptyState.Root flat>
                        <EmptyState.Icon>
                          <Receipt />
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
                      <Table.Cell card="title">
                        <Badge.Root color="neutral" appearance="tinted">
                          <Badge.Text>{formatOrderNumber(p.number)}</Badge.Text>
                        </Badge.Root>
                      </Table.Cell>
                      <Table.Cell label="Vendedor">
                        <Table.CellText variant="dim">
                          {p.seller?.name ?? "—"}
                        </Table.CellText>
                      </Table.Cell>
                      <Table.Cell label="Data">
                        <Table.CellText variant="dim">
                          {formatDate(p.orderDate)}
                        </Table.CellText>
                      </Table.Cell>
                      <Table.Cell align="right" card="amount" label="Valor">
                        <Table.CellText variant="strong">
                          {formatCurrency(p.totalAmount)}
                        </Table.CellText>
                      </Table.Cell>
                      {/* No cartão a situação divide a última linha com as ações. */}
                      <Table.Cell card="aside">
                        <Badge.Root
                          color={orderStatusTone(p.status)}
                          appearance="tinted"
                        >
                          <Badge.Text>{orderStatusLabel(p.status)}</Badge.Text>
                        </Badge.Root>
                      </Table.Cell>
                      <Table.Cell card="actions">
                        <OrderRowActions
                          orderCode={formatOrderNumber(p.number)}
                          onEdit={() => onEditOrder(p)}
                          remove={
                            canDeleteOrder(p.status)
                              ? {
                                  orderId: p.id,
                                  orderCode: formatOrderNumber(p.number),
                                  onDeleted: () => refetch(),
                                  onRemoveOptimistic:
                                    optimistic.removeOptimistic,
                                  onCommit: optimistic.commit,
                                  onRollback: optimistic.rollback,
                                }
                              : undefined
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Table>
            <Table.Footer>
              <Table.Footer.Info>
                {totalCount > 0
                  ? `${plural(totalCount, "pedido", "pedidos")} · página ${currentPage} de ${totalPages}`
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
