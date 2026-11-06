"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { ToggleGroup } from "@/components/ToggleGroup";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { getBrtTodayIso } from "@/utils/format/date";
import { useQuery } from "@apollo/client/react";
import { ShoppingBasket } from "lucide-react";
import { useMemo, useState } from "react";
import { CLIENT_LAST_PURCHASES_QUERY } from "./gql";
import { ClientLastPurchasesQueryResponse, PurchaseView } from "./interface";
import { groupPurchases, purchaseCountLabel, sinceLabel } from "./utils";

const VIEW_OPTIONS: { value: PurchaseView; label: string }[] = [
  { value: "factory", label: "Por fábrica" },
  { value: "seller", label: "Por vendedor" },
];

const COLUMNS = 5;

interface Props {
  companyClientId: string;
}

/**
 * Última compra do cliente por fábrica ou por vendedor.
 *
 * A linha leva ao PEDIDO da última compra: é lá que está o que o cliente levou,
 * que é a pergunta seguinte de quem lê "comprou há 20 dias".
 */
export function LastPurchasesTable({ companyClientId }: Props) {
  const [view, setView] = useState<PurchaseView>("factory");
  const { data, loading } = useQuery<ClientLastPurchasesQueryResponse>(
    CLIENT_LAST_PURCHASES_QUERY,
    { variables: { id: companyClientId }, skip: !companyClientId }
  );

  const purchases = data?.companyClient?.data?.lastPurchases;
  const rows = useMemo(
    () => groupPurchases(purchases ?? [], view),
    [purchases, view]
  );
  const todayIso = getBrtTodayIso();
  const isByFactory = view === "factory";

  return (
    <Table.Root data-tour="client-last-purchases">
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Últimas compras
          <HelpTooltip
            label="O que conta como compra?"
            content="Mostra quando o cliente comprou pela última vez de cada fábrica, ou com cada vendedor. Orçamentos e pedidos cancelados não contam. Toque numa linha para abrir o pedido."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <ToggleGroup
            options={VIEW_OPTIONS}
            value={view}
            onChange={setView}
            aria-label="Ver as últimas compras por fábrica ou por vendedor"
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>{isByFactory ? "Fábrica" : "Vendedor"}</Table.Head>
            <Table.Head>Última compra</Table.Head>
            <Table.Head>{isByFactory ? "Vendido por" : "Fábrica"}</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Compras</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && rows.length === 0 ? (
            <Table.Skeleton columns={COLUMNS} rows={3} />
          ) : rows.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <ShoppingBasket size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma compra ainda</EmptyState.Title>
                  <EmptyState.Description>
                    Quando este cliente fizer um pedido, a última compra aparece
                    aqui.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            rows.map((row) => (
              <Table.Row key={row.key} href={`/orders/${row.lastOrderId}`}>
                <Table.Cell variant="strong" title={row.name}>
                  {row.name}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDateDMY(row.lastOrderDate)}
                  <Table.CellText variant="dim" className="ml-4">
                    {sinceLabel(row.lastOrderDate, todayIso)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell variant="dim" title={row.counterpart}>
                  {row.counterpart}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.lastOrderAmount)}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className="whitespace-nowrap"
                  title={`Total comprado: ${formatMoney(row.totalAmount)}`}
                >
                  {purchaseCountLabel(row.orderCount)}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
