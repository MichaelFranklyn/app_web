"use client";

import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
} from "@/app/(inside)/_shared/commissions";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Coins } from "lucide-react";

import { CommissionRow } from "../../interface";
import { summarize } from "../../utils";

interface Props {
  items: CommissionRow[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
}

/**
 * As parcelas de comissão do período, ordenadas pela data em que caem.
 *
 * A coluna "Conferida" existe porque este é o papel que se cruza com a planilha
 * da fábrica: marcar o que já bateu é metade do trabalho, e sem a marca a
 * conferência recomeça do zero na próxima vez.
 */
export function CommissionsReportTable({
  items,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const page = summarize(items);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Parcelas de comissão</Table.CardHead.Title>
        <Table.CardHead.Description>
          Pela data em que a comissão cai — não pela data do pedido.
        </Table.CardHead.Description>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Recebimento</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Parcela</Table.Head>
            <Table.Head>Valor da parcela</Table.Head>
            <Table.Head>Comissão</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head>Conferida</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={9} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={9}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Coins size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma comissão no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    A comissão cai depois do faturamento e do prazo de
                    pagamento. Amplie o período para ver as parcelas mais à
                    frente.
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
                  {row.receiveDate ? formatDateDMY(row.receiveDate) : "—"}
                </Table.Cell>
                <Table.Cell
                  variant="strong"
                  className="max-w-[200px] truncate"
                  title={clientName(row.client)}
                >
                  {clientName(row.client)}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className="max-w-[160px] truncate"
                  title={factoryName(row.factory)}
                >
                  {factoryName(row.factory)}
                </Table.Cell>
                <Table.Cell variant="dim">{row.seller?.name ?? "—"}</Table.Cell>
                <Table.Cell variant="dim">{row.sequence}</Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatMoney(row.installmentAmount)}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.amount)}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={COMMISSION_STATUS_TONE[row.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      {COMMISSION_STATUS_LABEL[row.status]}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell variant="dim">
                  {row.isReconciled ? "Sim" : "—"}
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
          {/* Sem linhas o rodapé fica quieto: repetir aqui a frase do estado
              vazio dizia a mesma coisa duas vezes na mesma tela. */}
          {totalItems > 0 &&
            `${totalItems} parcelas · página ${currentPage} de ${totalPages} · nesta página: a receber ${formatMoney(page.receivable)}, recebido ${formatMoney(page.received)}`}
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
