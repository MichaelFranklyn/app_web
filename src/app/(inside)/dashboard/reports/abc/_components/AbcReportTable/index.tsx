"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { TrendingUp } from "lucide-react";

import { formatPercent } from "../../../../utils";
import { AbcRow } from "../../interface";
import { ABC_CLASS_COLOR, ABC_CLASS_HINT, sumBy } from "../../utils";

interface Props {
  items: AbcRow[];
  loading: boolean;
  /** Campos do painel: cliente e classe. */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  sort: TableSort;
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
  filterFields,
  inputValues,
  setFilter,
  setFilters,
  sort,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const pageAmount = sumBy(items, (row) => row.totalAmount);
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Clientes por faturamento
          <HelpTooltip
            label="Sobre a curva ABC"
            content="Pelo que a fábrica faturou no período — a mesma base da aba Vendas. A coluna do acumulado é o que se lê de fato: nela se acha a linha em que a carteira chega aos 80%."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            onTextChange={setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="rank">#</Table.Head>
            <Table.Head sortKey="client">Cliente</Table.Head>
            <Table.Head sortKey="abcClass">Classe</Table.Head>
            <Table.Head sortKey="totalAmount" sortFirst="desc">
              Faturamento
            </Table.Head>
            <Table.Head sortKey="share" sortFirst="desc">
              Participação
            </Table.Head>
            <Table.Head sortKey="cumulativeShare">Acumulado</Table.Head>
            <Table.Head sortKey="orderCount" sortFirst="desc">
              Pedidos
            </Table.Head>
            <Table.Head sortKey="lastOrderDate" sortFirst="desc">
              Último faturamento
            </Table.Head>
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
                    {isNarrowed
                      ? "Nenhum cliente com esses filtros"
                      : "Nenhum faturamento no período"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Tente outra classe ou outro nome no painel de filtros."
                      : "A curva é montada sobre o que a fábrica já faturou. Amplie o período."}
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
