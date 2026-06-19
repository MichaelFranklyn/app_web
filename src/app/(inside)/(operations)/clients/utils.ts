import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { FieldConfig } from "@/hooks/useTableState";
import { ClientsStats } from "./interface";

export const formatCity = (
  city: string | null,
  state: string | null
): string => {
  return [city, state].filter(Boolean).join(" / ") || "—";
};

export const TABLE_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "razao_social" },
};

export const buildKpis = (stats: ClientsStats): KpiItem[] => {
  const { totalClients, activeClients, atRiskClients, noVisit30d } =
    stats.clientStats;

  return [
    {
      label: "Total de clientes",
      value: String(totalClients),
      delta: "carteira da empresa",
      status: "atencao",
    },
    {
      label: "Clientes ativos",
      value: String(activeClients),
      delta: `${totalClients ? Math.round((activeClients / totalClients) * 100) : 0}% da carteira`,
      positive: true,
      status: "ok",
    },
    {
      label: "Em risco de churn",
      value: String(atRiskClients),
      delta: "score acima de 70",
      negative: atRiskClients > 0,
      status: atRiskClients > 0 ? "urgente" : "ok",
    },
    {
      label: "Sem visita há 30d+",
      value: String(noVisit30d),
      delta: "sem visita recente",
      negative: noVisit30d > 0,
      status: noVisit30d > 0 ? "neutral" : "ok",
      valueClassName: noVisit30d > 0 ? "text-(--blue)!" : undefined,
    },
  ];
};
