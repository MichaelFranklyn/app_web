import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { USERS_KPI_HELP } from "../../help";
import { SellersStats } from "../../interface";

export const buildKpis = (stats: SellersStats): KpiItem[] => {
  // Defensivo: se `stats` vier ausente, degrada para zeros sem quebrar a página.
  const {
    totalCount = 0,
    activeCount = 0,
    activeFactoryAccessCount = 0,
    inactiveFactoryAccessCount = 0,
  } = stats ?? {};

  // Fábricas por vendedor, com uma casa: é uma MÉDIA, não uma porcentagem.
  // O texto anterior dividia acessos por vendedores e chamava o resultado de
  // "% da carteira" — cinco vendedores com quinze acessos viravam "300% da
  // carteira", um número que não quer dizer nada e que ninguém consegue conferir.
  const perSeller =
    activeCount > 0 ? (activeFactoryAccessCount / activeCount).toFixed(1) : "0";

  return [
    {
      label: "Vendem em campo",
      value: String(activeCount),
      positive: true,
      delta: `de ${totalCount} com perfil de vendedor`,
      status: "ok",
      help: USERS_KPI_HELP["Vendem em campo"],
    },
    {
      label: "Acessos a fábricas",
      value: String(activeFactoryAccessCount),
      delta: `${perSeller} fábricas por vendedor, em média`,
      positive: true,
      status: "neutral",
      help: USERS_KPI_HELP["Acessos a fábricas"],
    },
    {
      label: "Acessos suspensos",
      value: String(inactiveFactoryAccessCount),
      delta:
        inactiveFactoryAccessCount > 0 ? "requerem atenção" : "tudo normal",
      negative: inactiveFactoryAccessCount > 0,
      status: inactiveFactoryAccessCount > 0 ? "urgente" : "ok",
      help: USERS_KPI_HELP["Acessos suspensos"],
    },
  ];
};
