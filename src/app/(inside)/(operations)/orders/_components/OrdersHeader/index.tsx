"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { TrendingDown, TrendingUp } from "lucide-react";
import { FilterField } from "@/components/Filters";
import { ReportOrder } from "@/utils/pdf/context";
import { Order, OrdersStats } from "../../interface";
import { buildOrderKpis } from "../../utils";
import { AddOrderModal } from "./AddOrderModal";
import { ExportOrdersButton, QueryFilter } from "./ExportOrdersButton";
import { ImportOrderModal } from "./ImportOrderModal";
import { FeatureGate } from "@/components/FeatureGate";

interface Props {
  stats?: OrdersStats;
  /** Há filtro ativo? Só muda a legenda dos cartões ("da empresa" × "no filtro"). */
  isFiltered?: boolean;
  onAddOptimistic: (order: Order) => void;
  /** O MESMO recorte da tabela (aba + painel), para a exportação repeti-lo. */
  exportFilters: QueryFilter[];
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  /** Ordenação à vista na tabela — o arquivo sai na mesma ordem. */
  order?: ReportOrder | null;
  /** Aba corrente, quando ela restringe a lista ("Ainda não faturados"). */
  scopeLabel?: string | null;
  hasOrders: boolean;
}

const KPI_COUNT = 4;

export function OrdersHeader({
  stats,
  isFiltered,
  onAddOptimistic,
  exportFilters,
  filterFields,
  inputValues,
  order,
  scopeLabel,
  hasOrders,
}: Props) {
  const kpis = stats ? buildOrderKpis(stats, isFiltered) : null;

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Pedidos</PanelHeader.Title>
            <PanelHeader.Description>
              Gestão de pedidos por fábrica e vendedor.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6" data-tour="orders-actions">
              <ExportOrdersButton
                filters={exportFilters}
                filterFields={filterFields}
                inputValues={inputValues}
                order={order}
                scopeLabel={scopeLabel}
                disabled={!hasOrders}
              />
              {/* Importação em massa é recurso de plano. */}
              <FeatureGate feature="BULK_IMPORT">
                <ImportOrderModal onAddOptimistic={onAddOptimistic} />
              </FeatureGate>
              <AddOrderModal onAddOptimistic={onAddOptimistic} />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 2, desktop: 4 }} gap={20}>
        {kpis
          ? kpis.map(
              ({
                label,
                value,
                delta,
                positive,
                negative,
                status,
                valueClassName,
              }) => (
                <Grid.Item key={label}>
                  <Card.Kpi>
                    <Card.Kpi.Label>{label}</Card.Kpi.Label>
                    <Card.Kpi.Value status={status} className={valueClassName}>
                      {value}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta positive={positive} negative={negative}>
                      {positive && <TrendingUp size={12} />}
                      {negative && <TrendingDown size={12} />}
                      {delta}
                    </Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
              )
            )
          : Array.from({ length: KPI_COUNT }).map((_, i) => (
              <Grid.Item key={i}>
                <Card.Kpi>
                  <Loading.Skeleton className="h-[12px] w-24" />
                  <Loading.Skeleton className="mt-8 h-[28px] w-32" />
                  <Loading.Skeleton className="mt-8 h-[10px] w-28" />
                </Card.Kpi>
              </Grid.Item>
            ))}
      </Grid.Root>
    </>
  );
}
