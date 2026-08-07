"use client";

import { Card } from "@/components/Card";
import { FilterField } from "@/components/Filters";
import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { ReportOrder } from "@/utils/pdf/context";
import { Network, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { getButtonClasses } from "@/components/Button/Root/style";
import { Title } from "@/components/Title";
import { Client, ClientsStats } from "../../interface";
import { buildKpis } from "../../utils";
import { AddClientModal } from "./AddClientModal";
import { ExportClientsButton } from "./ExportClientsButton";
import { ImportClientsModal } from "./ImportClientsModal";

// Link com aparência de botão secundário (o mesmo do "Importar" ao lado).
const networksLinkClass = getButtonClasses({
  appearance: "outline",
  color: "neutral",
  size: "sm",
  isIconOnly: false,
  fullWidth: false,
  active: false,
  noPadding: false,
  noUppercase: true,
});

interface ClientsHeaderProps {
  stats: ClientsStats;
  onAddOptimistic: (client: Client) => void;
  /** Filtros ativos na tela — o export baixa o mesmo recorte que está à vista. */
  inputValues: Record<string, string>;
  /** Campos do painel de filtros, para o PDF escrever o recorte por extenso. */
  filterFields: FilterField[];
  /** Ordenação à vista na tabela — o arquivo sai na mesma ordem. */
  order?: ReportOrder | null;
  hasClients: boolean;
}

export function ClientsHeader({
  stats,
  onAddOptimistic,
  inputValues,
  filterFields,
  order,
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
                filterFields={filterFields}
                order={order}
                disabled={!hasClients}
              />
              {/* Redes não têm item próprio na sidebar: são um recorte da
                  carteira, e é daqui que se chega nelas. Link precisa ser <a>,
                  não <button> — mesma solução do ContactLinks. */}
              <Link href="/clients/networks" className={networksLinkClass}>
                <Network size={16} />
                <Title variant="label" weight="bold">
                  Redes
                </Title>
              </Link>
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
