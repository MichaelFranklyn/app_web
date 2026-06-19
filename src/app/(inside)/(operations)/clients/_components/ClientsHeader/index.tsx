"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { ClientsStats } from "../../interface";
import { buildKpis } from "../../utils";
import { AddClientModal } from "./AddClientModal";

interface ClientsHeaderProps {
  stats: ClientsStats;
}

export function ClientsHeader({ stats }: ClientsHeaderProps) {
  const kpis = buildKpis(stats);

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              03 — Clientes
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>
              Clientes
            </PanelHeader.Title>
            <PanelHeader.Description>
              Carteira de clientes da empresa. Dados globais complementados com
              informações privadas.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              <Button.Root
                appearance="outline"
                color="neutral"
                size="md"
                noUppercase
              >
                <Button.Icon icon={Download} />
                <Button.Title>Exportar</Button.Title>
              </Button.Root>
              <AddClientModal />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={20}>
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
