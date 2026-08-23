"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";

import { BillingRow } from "../../interface";
import {
  BILLING_SITUATION_COLOR,
  BILLING_SITUATION_LABEL,
  dueDateLabel,
  overdueLabel,
  sumBy,
} from "../../utils";

interface Props {
  items: BillingRow[];
  loading: boolean;
  /** Campos do painel: cliente, situação, fábrica e vendedor. */
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
 * As duplicatas do período, uma por linha, do vencimento mais antigo para o
 * mais novo — que é a ordem em que a cobrança trabalha.
 *
 * A linha leva ao PEDIDO: conferindo o boleto, a pergunta seguinte é sempre
 * "de que pedido é esse valor". O rodapé soma a página à vista e diz isso; o
 * total do período está nos cartões acima.
 */
export function BillingReportTable({
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
  const pageAmount = sumBy(items, (row) => row.amount);
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Duplicatas do período
          <HelpTooltip
            label="Sobre as duplicatas do período"
            content="Recortadas pela data de VENCIMENTO (a agenda de cobrança), das mais antigas para as mais novas. Um pedido faturado em junho com boleto para agosto é problema de agosto."
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
            <Table.Head sortKey="dueDate">Vencimento</Table.Head>
            <Table.Head sortKey="situation">Situação</Table.Head>
            <Table.Head sortKey="daysOverdue" sortFirst="desc">
              Atraso
            </Table.Head>
            <Table.Head sortKey="client">Cliente</Table.Head>
            <Table.Head sortKey="factory">Fábrica</Table.Head>
            <Table.Head>Parcela</Table.Head>
            <Table.Head sortKey="amount" sortFirst="desc">
              Valor
            </Table.Head>
            <Table.Head sortKey="commissionAmount" sortFirst="desc">
              Comissão
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
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhuma duplicata com esses filtros"
                      : "Nenhuma duplicata no período"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Tente outra situação ou outra fábrica no painel de filtros."
                      : "As parcelas nascem no faturamento do pedido, pelo prazo de pagamento escolhido. Amplie o período."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row
                key={row.installmentId}
                href={`/orders/${row.orderId}`}
              >
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {dueDateLabel(row.dueDate)}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={BILLING_SITUATION_COLOR[row.situation]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      {BILLING_SITUATION_LABEL[row.situation]}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell
                  variant={row.daysOverdue > 0 ? "strong" : "dim"}
                  className="whitespace-nowrap"
                >
                  {overdueLabel(row.daysOverdue)}
                </Table.Cell>
                <Table.Cell variant="strong" title={row.clientName}>
                  {row.clientName}
                </Table.Cell>
                <Table.Cell variant="dim" title={row.factoryName}>
                  {row.factoryName}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.sequence}
                  {row.paidAt && ` · pago ${formatDateDMY(row.paidAt)}`}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.amount)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatMoney(row.commissionAmount)}
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
            `${totalItems} parcela(s) · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(pageAmount)}`}
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
