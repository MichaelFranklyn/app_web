"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { TrendingDown, TrendingUp } from "lucide-react";
import { SellersStats } from "../../interface";
import { buildKpis } from "./utils";

interface SellersHeaderProps {
  stats: SellersStats;
}

export function SellersHeader({ stats }: SellersHeaderProps) {
  const kpis = buildKpis(stats);

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              Configurações
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>
              Vendedores
            </PanelHeader.Title>
            <PanelHeader.Description>
              Perfis de vendedores em campo e controle de acesso por fábrica.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* KPIs */}
      <Grid.Root cols={{ base: 1, "desktop-xl": 3 }} gap={20}>
        {kpis.map(
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
        )}
      </Grid.Root>
    </>
  );
}
