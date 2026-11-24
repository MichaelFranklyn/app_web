"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { ToggleGroup } from "@/components/ToggleGroup";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import {
  daysAgoLabel,
  PURCHASE_STATUS_COLOR,
  PURCHASE_STATUS_HINT,
  PURCHASE_STATUS_LABEL,
  unitsLabel,
} from "@/utils/productPurchase";
import { PackageSearch } from "lucide-react";

import { PRODUCT_COLUMN_HELP } from "../../help";
import { ClientProductAnalysisRow } from "../../interface";
import { cycleLabel, isStaple, overdueLabel, roundedUnits } from "../../utils";
import { useProductAnalysisTable } from "../../useProductAnalysisTable";

/**
 * Quanto histórico olhar. Dois anos é o padrão do backend; "todo o histórico"
 * (0) existe para o cliente antigo, e 12 meses para quem quer ler só o ano
 * corrente sem o ruído do que ele comprava antes.
 */
const PERIOD_OPTIONS = [
  { label: "12 meses", value: 12 },
  { label: "2 anos", value: 24 },
  { label: "Tudo", value: 0 },
];

interface Props {
  table: ReturnType<typeof useProductAnalysisTable>;
  rows: ClientProductAnalysisRow[];
  months: number;
  onMonthsChange: (months: number) => void;
}

/** "8 de 10 pedidos" — a fração é o que responde "ele compra sempre?". */
const presenceLabel = (row: ClientProductAnalysisRow): string =>
  `${row.orderCount} de ${row.factoryOrderCount} pedidos`;

export function ProductAnalysisTable({
  table,
  rows,
  months,
  onMonthsChange,
}: Props) {
  return (
    <Table.Root sort={table.sort}>
      <Table.CardHead>
        {/* Um título só: "O que ele compra" acima do card e "Produtos deste
            cliente" dentro dele diziam a mesma coisa (crítica de 23/11/2026). */}
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          O que ele compra
          <HelpTooltip
            label="Como esta análise é feita?"
            content="Para cada produto, olhamos em quais pedidos ele apareceu e de quanto em quanto tempo o cliente o repõe. Passado esse tempo, o produto entra em “hora de repor”; muito depois dele, em “parou de comprar”."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <ToggleGroup
            aria-label="Período"
            options={PERIOD_OPTIONS}
            value={months}
            onChange={onMonthsChange}
          />
          <Filters
            resultCount={table.totalItems}
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada produto vira um cartão: as 8 colunas rolando
          de lado escondiam a situação, que é o que mais importa. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="product" title={PRODUCT_COLUMN_HELP.product}>
              Produto
            </Table.Head>
            <Table.Head sortKey="factory" title={PRODUCT_COLUMN_HELP.factory}>
              Fábrica
            </Table.Head>
            <Table.Head sortKey="presence" title={PRODUCT_COLUMN_HELP.presence}>
              Aparece em
            </Table.Head>
            <Table.Head
              sortKey="lastPurchase"
              sortFirst="desc"
              title={PRODUCT_COLUMN_HELP.lastPurchase}
            >
              Última compra
            </Table.Head>
            <Table.Head sortKey="cycle" title={PRODUCT_COLUMN_HELP.cycle}>
              Ritmo de compra
            </Table.Head>
            <Table.Head sortKey="expected" title={PRODUCT_COLUMN_HELP.expected}>
              Próxima esperada
            </Table.Head>
            <Table.Head sortKey="amount" title={PRODUCT_COLUMN_HELP.amount}>
              Quantidade
            </Table.Head>
            <Table.Head sortKey="status" title={PRODUCT_COLUMN_HELP.status}>
              Situação
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.displayedData.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <PackageSearch size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {table.totalUnfiltered > 0
                      ? "Nenhum produto encontrado"
                      : "Nenhuma compra registrada"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {table.totalUnfiltered > 0
                      ? "Ajuste os filtros para encontrar o produto."
                      : "Quando este cliente fizer pedidos, os produtos dele aparecem aqui com o ritmo de compra de cada um."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            table.displayedData.map((row) => (
              <Table.Row key={`${row.productId}-${row.factoryId}`}>
                <Table.Cell card="title">
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      {row.product?.name ?? "Produto"}
                    </Table.CellText>
                    {row.product?.sku && (
                      <Table.CellText variant="dim">
                        {row.product.sku}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell label="Fábrica">
                  <Table.CellText variant="dim">
                    {factoryName(row.factory)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell label="Aparece em">
                  <div className="flex flex-col items-start gap-2">
                    <Table.CellText variant="dim">
                      {presenceLabel(row)}
                    </Table.CellText>
                    {/* A marca fica na coluna que a explica: é o produto que
                        quase todo pedido daquela fábrica leva. */}
                    {isStaple(row) && (
                      <Badge.Root color="green" appearance="tinted" size="sm">
                        <Badge.Text>Item fixo</Badge.Text>
                      </Badge.Root>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell label="Última compra">
                  <div className="flex flex-col">
                    <Table.CellText variant="dim">
                      {formatDate(row.lastPurchaseDate)}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {daysAgoLabel(row.daysSinceLast)}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell label="Ritmo de compra">
                  <Table.CellText variant="dim">
                    {cycleLabel(row.avgIntervalDays, row.orderCount)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell label="Próxima esperada">
                  <div className="flex flex-col">
                    <Table.CellText variant="dim">
                      {row.expectedNextDate
                        ? formatDate(row.expectedNextDate)
                        : "—"}
                    </Table.CellText>
                    {/* Data no passado sem dizer que passou parecia futura. */}
                    {overdueLabel(row.overdueDays) && (
                      <Table.CellText variant="danger">
                        {overdueLabel(row.overdueDays)}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell label="Quantidade">
                  <div className="flex flex-col">
                    <Table.CellText variant="dim">
                      {`${unitsLabel(row.lastUnits)} na última`}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {`média ${unitsLabel(roundedUnits(row.avgUnits))}`}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                {/* Detalhe, e não `card="status"`: no cartão a tag fecha a lista,
                    embaixo da Quantidade, como "Situação: [tag]" (14/11/2026). */}
                <Table.Cell label="Situação">
                  <Badge.Root
                    color={PURCHASE_STATUS_COLOR[row.status]}
                    appearance="tinted"
                    title={PURCHASE_STATUS_HINT[row.status]}
                  >
                    <Badge.Text>{PURCHASE_STATUS_LABEL[row.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
      <Table.Footer>
        <Table.Footer.Info>
          {rows.length > 0
            ? `${table.totalItems} de ${rows.length} produto(s)`
            : "Nenhum produto"}
        </Table.Footer.Info>
      </Table.Footer>
    </Table.Root>
  );
}
