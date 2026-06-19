"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Order, OrdersStats } from "../../interface";
import { buildOrderKpis } from "../../utils";
import { AddOrderModal } from "./AddOrderModal";
import { ImportOrderModal } from "./ImportOrderModal";

interface Props {
  stats?: OrdersStats;
  onAddOptimistic: (order: Order) => void;
}

const KPI_COUNT = 3;

export function OrdersHeader({ stats, onAddOptimistic }: Props) {
  const kpis = stats ? buildOrderKpis(stats) : null;

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>05 — Pedidos</PanelHeader.Eyebrow>
            <PanelHeader.Title>
              Pedidos
            </PanelHeader.Title>
            <PanelHeader.Description>
              Gestão de pedidos por fábrica e vendedor.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              <ImportOrderModal onAddOptimistic={onAddOptimistic} />
              <AddOrderModal onAddOptimistic={onAddOptimistic} />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 3 }} gap={20}>
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
