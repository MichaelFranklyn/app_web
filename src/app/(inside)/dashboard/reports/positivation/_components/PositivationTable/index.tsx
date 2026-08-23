"use client";

import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Users } from "lucide-react";

import { PositivationFactory, PositivationRow } from "../../interface";
import { positivatedLabel } from "../../utils";
import { PositivationCellMark } from "../PositivationCell";

interface Props {
  factories: PositivationFactory[];
  items: PositivationRow[];
  loading: boolean;
  /** Campos do painel: cliente, positivação, fábrica e vendedor. */
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
 * A matriz: um cliente por linha, uma fábrica por coluna.
 *
 * As colunas de fábrica são estreitas e centradas de propósito — o que se lê aqui
 * é o PADRÃO da linha ("compra tudo", "compra só de uma"), não cada valor. Os
 * números de cada célula ficam no tooltip, e o nome do cliente é truncado com
 * largura máxima para a tabela nunca rolar na horizontal.
 */
export function PositivationTable({
  factories,
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
  const columnCount = factories.length + 4;
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Cliente × fábrica
          <HelpTooltip
            label="Sobre a matriz de positivação"
            content="Visto verde comprou no período; traço âmbar é vínculo sem compra; ponto é fábrica que o cliente não atende."
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
            <Table.Head sortKey="client">Cliente</Table.Head>
            {factories.map((factory) => (
              <Table.Head key={factory.factoryId} className="text-center">
                {factory.factoryName}
              </Table.Head>
            ))}
            <Table.Head sortKey="positivated" sortFirst="desc">
              Positivou
            </Table.Head>
            <Table.Head sortKey="totalAmount" sortFirst="desc">
              Valor no período
            </Table.Head>
            <Table.Head sortKey="lastOrderDate" sortFirst="desc">
              Última compra
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={columnCount} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columnCount}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum cliente com esses filtros"
                      : "Nenhum cliente na carteira"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Com o filtro de zerados vazio, é boa notícia: todo cliente com vínculo comprou de alguma fábrica no período."
                      : "A positivação parte dos vínculos ativos: vincule clientes às fábricas para o relatório ter linhas."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row
                key={row.clientId}
                href={
                  row.companyClientId
                    ? `/clients/${row.companyClientId}`
                    : undefined
                }
              >
                <Table.Cell variant="strong" title={row.clientName}>
                  {row.clientName}
                </Table.Cell>

                {row.cells.map((cell) => (
                  <Table.Cell key={cell.factoryId} className="text-center">
                    <PositivationCellMark cell={cell} />
                  </Table.Cell>
                ))}

                <Table.Cell
                  variant={row.positivatedFactories === 0 ? "default" : "dim"}
                >
                  {positivatedLabel(row)}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.totalAmount)}
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
            `${totalItems} cliente(s) · página ${currentPage} de ${totalPages}`}
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
