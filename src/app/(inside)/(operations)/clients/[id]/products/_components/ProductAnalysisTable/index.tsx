"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Table } from "@/components/Table";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { PackageSearch } from "lucide-react";

import { PRODUCT_COLUMN_HELP } from "../../help";
import { ClientProductAnalysisRow } from "../../interface";
import {
  cycleLabel,
  daysAgoLabel,
  isStaple,
  STATUS_COLOR,
  STATUS_HINT,
  STATUS_LABEL,
  unitsLabel,
} from "../../utils";
import { useProductAnalysisTable } from "../../useProductAnalysisTable";

interface Props {
  table: ReturnType<typeof useProductAnalysisTable>;
  rows: ClientProductAnalysisRow[];
}

/** "8 de 10 pedidos" — a fração é o que responde "ele compra sempre?". */
const presenceLabel = (row: ClientProductAnalysisRow): string =>
  `${row.orderCount} de ${row.factoryOrderCount} pedidos`;

export function ProductAnalysisTable({ table, rows }: Props) {
  return (
    <Table.Root sort={table.sort}>
      <Table.CardHead>
        <Table.CardHead.Title>Produtos deste cliente</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="product" title={PRODUCT_COLUMN_HELP.product}>
              Produto
            </Table.Head>
            <Table.Head sortKey="factory" title={PRODUCT_COLUMN_HELP.factory}>
              Fábrica
            </Table.Head>
            <Table.Head sortKey="presence" title={PRODUCT_COLUMN_HELP.presence}>
              Compra sempre?
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
                <EmptyState.Root>
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
                <Table.Cell>
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
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {factoryName(row.factory)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
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
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="dim">
                      {formatDate(row.lastPurchaseDate)}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {daysAgoLabel(row.daysSinceLast)}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {cycleLabel(row.avgIntervalDays)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {row.expectedNextDate
                      ? formatDate(row.expectedNextDate)
                      : "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="dim">
                      {`${unitsLabel(row.lastUnits)} na última`}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {`média ${unitsLabel(row.avgUnits)}`}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={STATUS_COLOR[row.status]}
                    appearance="tinted"
                    title={STATUS_HINT[row.status]}
                  >
                    <Badge.Text>{STATUS_LABEL[row.status]}</Badge.Text>
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
