"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";

import { BillingRow, BillingScope } from "../../interface";
import {
  BILLING_SCOPES,
  BILLING_SITUATION_COLOR,
  BILLING_SITUATION_LABEL,
  dueDateLabel,
  overdueLabel,
  sumBy,
} from "../../utils";

interface Props {
  items: BillingRow[];
  loading: boolean;
  scope: BillingScope;
  onScopeChange: (scope: BillingScope) => void;
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
  scope,
  onScopeChange,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const pageAmount = sumBy(items, (row) => row.amount);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Duplicatas do período</Table.CardHead.Title>
        <Table.CardHead.Description>
          Recortadas pela data de vencimento, das mais antigas para as mais
          novas.
        </Table.CardHead.Description>
      </Table.CardHead>

      <div className="px-12 pb-8">
        <Tabs.Root
          value={scope}
          onValueChange={(value) => onScopeChange(value as BillingScope)}
        >
          <Tabs.List>
            {BILLING_SCOPES.map((option) => (
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
            <Table.Head>Vencimento</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head>Atraso</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Parcela</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Comissão</Table.Head>
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
                    Nenhuma duplicata no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    As parcelas nascem no faturamento do pedido, pelo prazo de
                    pagamento escolhido. Amplie o período ou confira a visão
                    escolhida acima.
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
                <Table.Cell
                  variant="strong"
                  className="max-w-[220px] truncate"
                  title={row.clientName}
                >
                  {row.clientName}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className="max-w-[160px] truncate"
                  title={row.factoryName}
                >
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
