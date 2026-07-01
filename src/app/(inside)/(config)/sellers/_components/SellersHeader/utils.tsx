import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { SellersStats } from "../../interface";

export const buildKpis = (stats: SellersStats): KpiItem[] => {
  // Defensivo: se `stats` vier ausente, degrada para zeros sem quebrar a página.
  const {
    totalCount = 0,
    activeCount = 0,
    activeFactoryAccessCount = 0,
    inactiveFactoryAccessCount = 0,
  } = stats ?? {};

  return [
    {
      label: "Vendedores ativos",
      value: String(activeCount),
      positive: true,
      delta: `de ${totalCount} cadastrados`,
      status: "ok",
    },
    {
      label: "Acessos a fábricas",
      value: String(activeFactoryAccessCount),
      delta: `${activeCount > 0 ? Math.round((activeFactoryAccessCount / activeCount) * 100) : 0}% da carteira`,
      positive: true,
      status: "neutral",
    },
    {
      label: "Acessos suspensos",
      value: String(inactiveFactoryAccessCount),
      delta:
        inactiveFactoryAccessCount > 0 ? "requerem atenção" : "tudo normal",
      negative: inactiveFactoryAccessCount > 0,
      status: inactiveFactoryAccessCount > 0 ? "urgente" : "ok",
    },
  ];
};
