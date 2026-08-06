"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { TrendingUp } from "lucide-react";

import { formatPercent } from "../../../../utils";
import { AbcRow, AbcScope } from "../../interface";
import {
  ABC_CLASS_COLOR,
  ABC_CLASS_HINT,
  ABC_SCOPES,
  sumBy,
} from "../../utils";

interface Props {
  items: AbcRow[];
  loading: boolean;
  scope: AbcScope;
  onScopeChange: (scope: AbcScope) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
}

/**
 * A curva linha a linha, do maior faturamento para o menor.
 *
 * A coluna do acumulado é o que se lê de fato: é nela que se acha a linha em
 * que a carteira chega aos 80% — o número de clientes que sustenta o mês.
 */
export function AbcReportTable({
  items,
  loading,
  scope,
  onScopeChange,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const pageAmount = sumBy(items, (row) => row.totalAmount);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Clientes por faturamento</Table.CardHead.Title>
        <Table.CardHead.Description>
          Pelo que a fábrica faturou no período — a mesma base da aba Vendas.
        </Table.CardHead.Description>
      </Table.CardHead>

      <div className="px-12 pb-8">
        <Tabs.Root
          value={scope}
          onValueChange={(value) => onScopeChange(value as AbcScope)}
        >
          <Tabs.List>
            {ABC_SCOPES.map((option) => (
              <Tabs.Item key={option.value} value={option.value}>
                {option.label}
              </Tabs.Item>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </div>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>#</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Classe</Table.Head>
            <Table.Head>Faturamento</Table.Head>
            <Table.Head>Participação</Table.Head>
            <Table.Head>Acumulado</Table.Head>
            <Table.Head>Pedidos</Table.Head>
            <Table.Head>Último faturamento</Table.Head>
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
                    <TrendingUp size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum faturamento no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    A curva é montada sobre o que a fábrica já faturou. Amplie o
                    período ou escolha outra classe acima.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row key={row.clientId}>
                <Table.Cell variant="dim">{row.rank}</Table.Cell>
                <Table.Cell
                  variant="strong"
                  className="max-w-[260px] truncate"
                  title={row.clientName}
                >
                  {row.clientName}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={ABC_CLASS_COLOR[row.abcClass]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      <span title={ABC_CLASS_HINT[row.abcClass]}>
                        {row.abcClass}
                      </span>
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.totalAmount)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatPercent(row.share)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatPercent(row.cumulativeShare)}
                </Table.Cell>
                <Table.Cell variant="dim">{row.orderCount}</Table.Cell>
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
            `${totalItems} cliente(s) · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(pageAmount)}`}
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
