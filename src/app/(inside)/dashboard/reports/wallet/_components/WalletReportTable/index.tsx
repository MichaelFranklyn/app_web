"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Users } from "lucide-react";

import {
  SITUATION_COLOR,
  SITUATION_HINT,
  SITUATION_LABEL,
} from "../../../situation";
import { WalletRow } from "../../interface";
import {
  cadenceLabel,
  cityAndState,
  idleLabel,
  riskLabel,
  sumBy,
} from "../../utils";

interface Props {
  items: WalletRow[];
  loading: boolean;
  /** Campos do painel: cliente, situação e UF. */
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
 * A carteira, um cliente por linha, em ordem alfabética — é assim que se
 * procura um nome específico, e a urgência já está nas visões acima da tabela.
 *
 * A linha leva ao cliente pelo id do VÍNCULO (`companyClientId`), que é a chave
 * da rota /clients/[id]; sem vínculo a linha não vira link, em vez de levar a
 * uma página que não existe.
 */
export function WalletReportTable({
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
  // A tabela vazia diz coisas diferentes: "a carteira está vazia" é um estado do
  // relatório, "não achei nada" é consequência do que a pessoa pediu.
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        {/* A explicação vai no "?" e não numa Description: o cabeçalho decide
            por MEDIÇÃO se as ações cabem na linha (useHeaderActionsMode), e um
            parágrafo aqui colapsaria o botão "Filtros" num ícone sem rótulo. */}
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Clientes da carteira
          <HelpTooltip
            label="Sobre a situação da carteira"
            content="A situação compara cada cliente com o próprio ritmo de compra, e é um retrato de hoje — o período do filtro governa só as colunas do período."
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
            <Table.Head sortKey="city">Cidade/UF</Table.Head>
            <Table.Head sortKey="situation">Situação</Table.Head>
            <Table.Head sortKey="idle" sortFirst="desc">
              Parado há
            </Table.Head>
            <Table.Head sortKey="cadence" sortFirst="desc">
              Ritmo
            </Table.Head>
            <Table.Head sortKey="risk" sortFirst="desc">
              Atraso
            </Table.Head>
            <Table.Head sortKey="lastOrderDate" sortFirst="desc">
              Última compra
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
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum cliente com esses filtros"
                      : "Nenhum cliente na carteira"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Tente outra situação ou outro estado no painel de filtros."
                      : "Confira se a carteira do vendedor selecionado tem clientes vinculados."}
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
                <Table.Cell
                  variant="strong"
                  className="max-w-[240px] truncate"
                  title={row.clientName}
                >
                  {row.clientName}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {cityAndState(row)}
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
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {idleLabel(row)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {cadenceLabel(row)}
                </Table.Cell>
                <Table.Cell
                  variant={
                    row.riskRatio && row.riskRatio > 1 ? "strong" : "dim"
                  }
                  className="whitespace-nowrap"
                >
                  {riskLabel(row)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—"}
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
