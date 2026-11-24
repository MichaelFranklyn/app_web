"use client";

import { Card } from "@/components/Card";
import React from "react";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { TrendingDown, TrendingUp } from "lucide-react";
import { FilterField } from "@/components/Filters";
import { ReportOrder } from "@/utils/pdf/context";
import { Order, OrdersStats } from "../../interface";
import { buildOrderKpis } from "../../utils";
import { ExportOrdersButton, QueryFilter } from "./ExportOrdersButton";
import { ImportOrderModal } from "./ImportOrderModal";
import { FeatureGate } from "@/components/FeatureGate";
import { OrderSheetButton } from "../../../_components/OrderSheetButton";
import { NewOrderButton } from "../../../_components/NewOrderButton";
import { MoreOptions } from "@/components/MoreOptions";
import { useOrdersPhoneMenu } from "./useOrdersPhoneMenu";

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
  /** Aba corrente, quando ela restringe a lista ("Esperando faturamento"). */
  scopeLabel?: string | null;
  hasOrders: boolean;
}

const ZERO_STATS: OrdersStats = {
  orderStats: {
    totalOrders: 0,
    totalAmount: "0",
    avgTicket: "0",
    invoicedOrders: 0,
    invoicedAmount: "0",
    commissionAmount: null,
    sellerCommissionAmount: "0",
    backorderCount: 0,
  },
};

/** O texto que vai chegar, invisível sob o shimmer: reserva a altura exata. */
function Pending({ children }: { children: React.ReactNode }) {
  return (
    <Loading.Skeleton aria-hidden className="w-fit max-w-full text-transparent">
      {children}
    </Loading.Skeleton>
  );
}

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
  // Sem os números ainda, os cartões saem com os rótulos e a ajuda reais (não
  // dependem de dado) e com o valor/legenda de um recorte zerado por baixo do
  // skeleton: o cartão já nasce na altura final. O skeleton genérico tinha
  // 128px contra 156–171px do real e empurrava a tabela ao chegar (tela
  // "tremendo", 17/11/2026).
  const isLoading = !stats;
  const kpis = buildOrderKpis(stats ?? ZERO_STATS, isFiltered);
  const exportOptions = {
    filters: exportFilters,
    filterFields,
    inputValues,
    order,
    scopeLabel,
  };
  const { menu, modalProps } = useOrdersPhoneMenu({
    ...exportOptions,
    canSelectSeller,
    hasOrders,
  });

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.orders}>
              Pedidos
            </PanelHeader.Heading>
            <PanelHeader.Actions data-tour="orders-actions">
              {/* No celular ficam só "Novo pedido" e o "Mais ações"; o CSS
                  esconde o resto desde o primeiro quadro, e os modais passam a
                  abrir pelo menu depois de hidratar. */}
              <div className="max-tablet:hidden contents">
                {/* A ficha offline sai daqui em branco; da tela do cliente ela
                    já vem com o cabeçalho preenchido. */}
                <OrderSheetButton
                  canSelectSeller={canSelectSeller}
                  {...modalProps("sheet")}
                />
                <ExportOrdersButton {...exportOptions} disabled={!hasOrders} />
                {/* Importação em massa é recurso de plano. */}
                <FeatureGate feature="BULK_IMPORT">
                  <ImportOrderModal
                    onAddOptimistic={onAddOptimistic}
                    canSelectSeller={canSelectSeller}
                    ownSellerId={ownSellerId}
                    {...modalProps("import")}
                  />
                </FeatureGate>
              </div>
              <NewOrderButton />
              <div className="tablet:hidden contents">
                <MoreOptions options={menu} showLabel />
              </div>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 2, tablet: 2, desktop: 4 }} gap={20}>
        {kpis.map(
          ({ label, value, delta, positive, negative, status, help }) => (
            <Grid.Item key={label}>
              <Card.Kpi aria-busy={isLoading || undefined}>
                {/* Os quatro cartões somam recortes diferentes (todos os
                    pedidos × só a mercadoria × só o faturado): sem a
                    explicação ao lado, um parece contradizer o outro. */}
                <Card.Kpi.Label className="inline-flex items-center gap-2">
                  {label}
                  {help && (
                    <HelpTooltip label={`Sobre ${label}`} content={help} />
                  )}
                </Card.Kpi.Label>
                <Card.Kpi.Value status={status}>
                  {isLoading ? <Pending>{value}</Pending> : value}
                </Card.Kpi.Value>
                {isLoading ? (
                  <Card.Kpi.Delta>
                    <Pending>{delta}</Pending>
                  </Card.Kpi.Delta>
                ) : (
                  <Card.Kpi.Delta positive={positive} negative={negative}>
                    {positive && <TrendingUp size={12} />}
                    {negative && <TrendingDown size={12} />}
                    {delta}
                  </Card.Kpi.Delta>
                )}
              </Card.Kpi>
            </Grid.Item>
          )
        )}
      </Grid.Root>
    </>
  );
}
