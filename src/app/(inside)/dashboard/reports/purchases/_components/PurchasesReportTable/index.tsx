"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ShoppingBasket } from "lucide-react";

import {
  SITUATION_COLOR,
  SITUATION_HINT,
  SITUATION_LABEL,
} from "../../../situation";
import { PurchaseRow } from "../../interface";
import {
  cadenceLabel,
  idleLabel,
  lastPurchaseLabel,
  rowHref,
  sumBy,
} from "../../utils";

interface Props {
  items: PurchaseRow[];
  loading: boolean;
  /** Campos do painel: cliente, fábrica e situação. */
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
 * Uma linha por cliente × fábrica, com a última compra daquele par.
 *
 * O mesmo cliente aparece uma vez por fábrica de propósito: é o par que tem
 * ritmo e que atrasa. Somar as fábricas num cliente só devolveria a carteira,
 * que é a outra aba — e apagaria justamente a fábrica em que ele parou.
 *
 * A linha leva ao PEDIDO da última compra (é lá que está o que ele levou); sem
 * nenhuma compra, leva ao cliente.
 */
export function PurchasesReportTable({
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
  const pageAmount = sumBy(items, (row) => row.periodAmount);
  // A tabela vazia diz coisas diferentes: "não há linha nenhuma" é um estado do
  // relatório, "não achei nada" é consequência do que a pessoa pediu.
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        {/* A explicação vai no "?" e não numa Description: o cabeçalho decide
            por MEDIÇÃO se as ações cabem na linha (ver useHeaderActionsMode), e
            um parágrafo aqui colapsava o botão "Filtros" em um ícone sem
            rótulo. */}
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Última compra por fábrica
          <HelpTooltip
            label="Sobre a última compra por fábrica"
            content="Uma linha por cliente em cada fábrica. A situação e o ritmo são desta fábrica, não do cliente inteiro — quem está em dia numa pode estar parado há meses em outra. O período do filtro governa só a coluna 'no período'."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            // A busca vai por aqui para manter o debounce do campo: pelo
            // `onChange` cada tecla refaria a lista.
            onTextChange={setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="client">Cliente</Table.Head>
            <Table.Head sortKey="factory">Fábrica</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head sortKey="lastOrderDate" sortFirst="desc">
              Última compra
            </Table.Head>
            <Table.Head sortKey="lastOrderAmount" sortFirst="desc">
              Valor
            </Table.Head>
            <Table.Head sortKey="idle" sortFirst="desc">
              Parado há
            </Table.Head>
            <Table.Head sortKey="cadence" sortFirst="desc">
              Ritmo
            </Table.Head>
            <Table.Head sortKey="periodAmount" sortFirst="desc">
              No período
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
                    <ShoppingBasket size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhuma linha com esses filtros"
                      : "Nenhuma fábrica vinculada"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Tente outra situação ou outra fábrica no painel de filtros."
                      : "As fábricas que cada cliente compra aparecem aqui, com a data da última compra em cada uma."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row
                key={`${row.clientId}-${row.factoryId}`}
                href={rowHref(row)}
              >
                <Table.Cell
                  variant="strong"
                  className="max-w-[220px] truncate"
                  title={row.clientName}
                >
                  {row.clientName}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className="max-w-[140px] truncate"
                  title={row.factoryName}
                >
                  {row.factoryName}
                  {/* Vínculo desfeito: a compra está no histórico e ninguém
                      atende esse cliente nessa fábrica hoje. */}
                  {!row.isLinked && (
                    <Title variant="micro" color="muted">
                      sem vínculo ativo
                    </Title>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={SITUATION_COLOR[row.situation]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      <span title={SITUATION_HINT[row.situation]}>
                        {SITUATION_LABEL[row.situation]}
                      </span>
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                {/* Só a data: o número do pedido aqui embaixo parecia código de
                    erro. Quem quer o pedido clica na linha, que abre ele. */}
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {lastPurchaseLabel(row)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.lastOrderDate ? formatMoney(row.lastOrderAmount) : "—"}
                </Table.Cell>
                <Table.Cell
                  variant={
                    row.riskRatio && row.riskRatio > 1 ? "strong" : "dim"
                  }
                  className="whitespace-nowrap"
                >
                  {idleLabel(row)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {cadenceLabel(row)}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.periodAmount)}
                  {row.periodOrderCount > 0 && (
                    <span className="ml-4 text-(--muted)">
                      {row.periodOrderCount} ped.
                    </span>
                  )}
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
            `${totalItems} linha(s) · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(pageAmount)}`}
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
