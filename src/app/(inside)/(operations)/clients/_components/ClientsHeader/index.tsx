"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Client, ClientsStats } from "../../interface";
import { buildKpis } from "../../utils";
import { AddClientModal } from "./AddClientModal";
import { ExportClientsButton } from "./ExportClientsButton";
import { ImportClientsModal } from "./ImportClientsModal";

interface ClientsHeaderProps {
  stats: ClientsStats;
  onAddOptimistic: (client: Client) => void;
  /** Filtros ativos na tela — o export baixa o mesmo recorte que está à vista. */
  inputValues: Record<string, string>;
  hasClients: boolean;
}

export function ClientsHeader({
  stats,
  onAddOptimistic,
  inputValues,
  hasClients,
}: ClientsHeaderProps) {
  const kpis = buildKpis(stats);

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Clientes</PanelHeader.Title>
            <PanelHeader.Description>
              Carteira de clientes da empresa. Dados globais complementados com
              informações privadas.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6" data-tour="clients-actions">
              <ExportClientsButton
                inputValues={inputValues}
                disabled={!hasClients}
              />
              <ImportClientsModal />
              <AddClientModal onAddOptimistic={onAddOptimistic} />
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
