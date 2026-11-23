"use client";

import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
} from "@/app/(inside)/_shared/commissions";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { Coins } from "lucide-react";

import { CommissionRow, CommissionsTotals } from "../../interface";

interface Props {
  items: CommissionRow[];
  loading: boolean;
  /** Campos do painel: cliente, fábrica, vendedor, situação e conferência. */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  sort: TableSort;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  /** Somas de TODAS as linhas que os filtros deixaram — não só desta página. */
  filteredTotals: CommissionsTotals;
  /**
   * Gestor: a comissão se abre em duas colunas — o que vai para o vendedor e o
   * que fica na empresa. Para o vendedor, "Comissão" já é a fatia dele.
   */
  withOffice: boolean;
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
  filterFields,
  inputValues,
  setFilter,
  setFilters,
  sort,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  filteredTotals,
  withOffice,
}: Props) {
  // Para o vendedor sai a coluna Vendedor (seria o nome dele em toda linha) e
  // as duas da divisão da comissão.
  const columns = withOffice ? 12 : 9;
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Parcelas de comissão
          <HelpTooltip
            label="Sobre as parcelas de comissão"
            content="Recortadas pela data em que a comissão CAI — não pela data do pedido. A coluna 'Conferida' marca o que já bateu com a planilha da fábrica."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            resultCount={totalItems}
            resultLoading={loading}
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            onTextChange={setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada parcela vira um cartão: 13 colunas rolavam
          para o lado até no notebook. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="receiveDate">Recebimento</Table.Head>
            <Table.Head sortKey="client">Cliente</Table.Head>
            <Table.Head sortKey="factory">Fábrica</Table.Head>
            {withOffice && <Table.Head sortKey="seller">Vendedor</Table.Head>}
            {/* Nota e parcela numa coluna só: "Parcela" sozinha era uma coluna
                inteira para um dígito. */}
            <Table.Head sortKey="invoiceNumber">Nota · parcela</Table.Head>
            <Table.Head sortKey="installmentAmount" sortFirst="desc">
              Valor da parcela
            </Table.Head>
            <Table.Head sortKey="amount" sortFirst="desc">
              {withOffice ? "Comissão da empresa" : "Comissão"}
            </Table.Head>
            {withOffice && (
              <Table.Head sortKey="sellerAmount" sortFirst="desc">
                Repasse ao vendedor
              </Table.Head>
            )}
            {withOffice && (
              <Table.Head sortKey="officeAmount" sortFirst="desc">
                Fica no escritório
              </Table.Head>
            )}
            <Table.Head sortKey="status">Situação</Table.Head>
            <Table.Head>Boleto</Table.Head>
            <Table.Head sortKey="isReconciled" sortFirst="desc">
              Conferida
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={columns} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Coins size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhuma parcela com esses filtros"
                      : "Nenhuma comissão no período"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Tente outra fábrica ou outra situação no painel de filtros."
                      : "A comissão cai depois do faturamento e do prazo de pagamento. Amplie o período para ver as parcelas mais à frente."}
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
                <Table.Cell
                  variant="strong"
                  className="whitespace-nowrap"
                  label="Recebimento"
                  emptyText="Sem data"
                >
                  {row.receiveDate ? formatDateDMY(row.receiveDate) : ""}
                </Table.Cell>
                <Table.Cell
                  variant="strong"
                  title={clientName(row.client)}
                  card="title"
                >
                  {clientName(row.client)}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  title={factoryName(row.factory)}
                  label="Fábrica"
                >
                  {factoryName(row.factory)}
                </Table.Cell>
                {withOffice && (
                  <Table.Cell
                    variant="dim"
                    label="Vendedor"
                    emptyText="Sem vendedor"
                  >
                    {row.seller?.name ?? ""}
                  </Table.Cell>
                )}
                <Table.Cell
                  variant="dim"
                  className="whitespace-nowrap"
                  label="Nota · parcela"
                >
                  {`${row.invoiceNumber ? `NF ${row.invoiceNumber}` : "Sem NF"} · ${row.sequence}ª`}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className="whitespace-nowrap"
                  label="Valor da parcela"
                >
                  {formatMoney(row.installmentAmount)}
                </Table.Cell>
                <Table.Cell
                  variant="strong"
                  className="whitespace-nowrap"
                  card="value"
                >
                  {formatMoney(row.amount)}
                </Table.Cell>
                {withOffice && (
                  <Table.Cell
                    variant="dim"
                    className="whitespace-nowrap"
                    label="Repasse ao vendedor"
                  >
                    {formatMoney(row.sellerAmount)}
                  </Table.Cell>
                )}
                {withOffice && (
                  <Table.Cell
                    variant="strong"
                    className="whitespace-nowrap"
                    label="Fica no escritório"
                  >
                    {formatMoney(Number(row.amount) - Number(row.sellerAmount))}
                  </Table.Cell>
                )}
                <Table.Cell card="status">
                  <Badge.Root
                    color={COMMISSION_STATUS_TONE[row.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      {COMMISSION_STATUS_LABEL[row.status]}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                {/* Situação do BOLETO do cliente: é o que trava a comissão —
                    vencido ainda pode virar pagamento, calote já não. */}
                <Table.Cell label="Boleto">
                  {row.defaultedAt ? (
                    <Badge.Root color="red" appearance="tinted">
                      <Badge.Text>Não pagou</Badge.Text>
                    </Badge.Root>
                  ) : row.isOverdue ? (
                    <Badge.Root color="warning" appearance="tinted">
                      <Badge.Text>Vencido</Badge.Text>
                    </Badge.Root>
                  ) : (
                    <Table.CellText variant="dim">Sem atraso</Table.CellText>
                  )}
                </Table.Cell>
                <Table.Cell variant="dim" label="Conferida">
                  {row.isReconciled ? "Sim" : "Não"}
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
            `${plural(totalItems, "parcela", "parcelas")} · página ${currentPage} de ${totalPages} · ${isNarrowed ? "no filtro" : "no período"}: a receber ${formatMoney(filteredTotals.receivable)}, recebido ${formatMoney(filteredTotals.received)}${filteredTotals.countOverdue > 0 ? `, ${plural(filteredTotals.countOverdue, "boleto", "boletos")} em atraso` : ""}`}
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
