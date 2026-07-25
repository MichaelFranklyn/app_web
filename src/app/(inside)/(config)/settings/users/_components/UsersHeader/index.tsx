"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { downloadCSV } from "@/utils/format/csv";
import { formatDateDMY } from "@/utils/format/masks";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { SellersStats, User } from "../../interface";
import { ROLE_LABEL, UserRole } from "../../utils";
import { AddUserModal } from "./AddUserModal";
import { buildKpis } from "./utils";

interface Props {
  stats: SellersStats;
  onAddOptimistic: (user: User) => void;
  items: User[];
}

export function UsersHeader({ stats, onAddOptimistic, items }: Props) {
  const kpis = buildKpis(stats);

  const handleExport = () => {
    const headers = ["Nome", "E-mail", "Perfil", "Vende em campo", "Desde"];
    const rows = items.map((u) => [
      u.name,
      u.email,
      ROLE_LABEL[u.role as UserRole] ?? u.role,
      u.seller ? "Sim" : "Não",
      formatDateDMY(u.createdAt),
    ]);
    downloadCSV("pessoas.csv", [headers, ...rows]);
  };

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Pessoas</PanelHeader.Title>
            <PanelHeader.Description>
              Quem entra no sistema e quem vende em campo — uma lista só. Clique
              em alguém para abrir o perfil completo.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-12" data-tour="users-actions">
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                disabled={items.length === 0}
                onClick={handleExport}
              >
                <Button.Icon icon={Download} />
                <Button.Title>Exportar</Button.Title>
              </Button.Root>
              <AddUserModal onAddOptimistic={onAddOptimistic} />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* KPIs da operação de campo: é o que muda no dia a dia. */}
      <Grid.Root cols={{ base: 1, tablet: 3 }} gap={20}>
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
