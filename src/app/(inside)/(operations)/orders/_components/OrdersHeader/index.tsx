"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
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
import { OrderSheetButton } from "../../../_components/OrderSheetButton";

interface Props {
  stats?: OrdersStats;
  /** Há filtro ativo? Só muda a legenda dos cartões ("da empresa" × "no filtro"). */
  isFiltered?: boolean;
  onAddOptimistic: (order: Order) => void;
  /** Gestor escolhe o vendedor do pedido novo; o vendedor logado, não. */
  canSelectSeller: boolean;
  /** Perfil de vendedor de quem usa a tela — dono implícito do pedido. */
  ownSellerId: string | null;
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
  canSelectSeller,
  ownSellerId,
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
              {/* A ficha offline sai daqui em branco; da tela do cliente ela já
                  vem com o cabeçalho preenchido. */}
              <OrderSheetButton canSelectSeller={canSelectSeller} />
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
                <ImportOrderModal
                  onAddOptimistic={onAddOptimistic}
                  canSelectSeller={canSelectSeller}
                  ownSellerId={ownSellerId}
                />
              </FeatureGate>
              <AddOrderModal
                onAddOptimistic={onAddOptimistic}
                canSelectSeller={canSelectSeller}
                ownSellerId={ownSellerId}
              />
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
                help,
              }) => (
                <Grid.Item key={label}>
                  <Card.Kpi>
                    {/* Os quatro cartões somam recortes diferentes (todos os
                        pedidos × só a mercadoria × só o faturado): sem a
                        explicação ao lado, um parece contradizer o outro. */}
                    <Card.Kpi.Label className="inline-flex items-center gap-2">
                      {label}
                      {help && (
                        <HelpTooltip label={`Sobre ${label}`} content={help} />
                      )}
                    </Card.Kpi.Label>
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
