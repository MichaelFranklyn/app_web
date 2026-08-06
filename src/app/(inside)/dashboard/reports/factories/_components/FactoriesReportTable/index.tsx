"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Building2 } from "lucide-react";

import { formatPercent } from "../../../../utils";
import { FactoryOrdersRow } from "../../interface";
import { invoicedRate, sumBy } from "../../utils";

interface Props {
  items: FactoryOrdersRow[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
}

/**
 * Uma linha por fábrica, da maior para a menor.
 *
 * A linha leva à fábrica: conferindo o papel, a pergunta seguinte é "o que
 * aconteceu lá". A coluna "faturado" traz a porcentagem junto do valor porque
 * é a razão entre os dois que se lê — quanto do que foi mandado já voltou.
 */
export function FactoriesReportTable({
  items,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const pageAmount = sumBy(items, (row) => row.totalAmount);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Fábricas do período</Table.CardHead.Title>
        <Table.CardHead.Description>
          Pedidos colocados em cada fábrica, pela data do pedido. Orçamento e
          cancelado ficam de fora.
        </Table.CardHead.Description>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Pedidos</Table.Head>
            <Table.Head>Clientes</Table.Head>
            <Table.Head>Valor colocado</Table.Head>
            <Table.Head>Ticket médio</Table.Head>
            <Table.Head>Já faturado</Table.Head>
            <Table.Head>Comissão</Table.Head>
            <Table.Head>Último pedido</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={8} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Building2 size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma fábrica com pedido no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Só entram fábricas que receberam pedido confirmado, faturado
                    ou entregue. Amplie o período no filtro acima.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row key={row.entityId} href={`/factories/${row.entityId}`}>
                <Table.Cell
                  variant="strong"
                  className="max-w-[220px] truncate"
                  title={row.entityName}
                >
                  {row.entityName}
                </Table.Cell>
                <Table.Cell variant="dim">{row.orderCount}</Table.Cell>
                <Table.Cell variant="dim">{row.clientCount}</Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.totalAmount)}
                  <span className="ml-4 text-(--muted)">
                    {formatPercent(row.share)}
                  </span>
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatMoney(row.avgTicket)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatMoney(row.invoicedAmount)}
                  <span className="ml-4 text-(--muted)">
                    {formatPercent(invoicedRate(row))}
                  </span>
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatMoney(row.commissionAmount)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—"}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {/* Sem linhas quem fala é o estado vazio, não o rodapé. */}
          {totalItems > 0 &&
            `${totalItems} fábrica(s) · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(pageAmount)}`}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
