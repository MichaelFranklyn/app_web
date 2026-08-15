"use client";

import { Loading } from "@/components/Loading";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { PortalMonthTotal } from "../../interface";
import { buildMonthlyChartOption } from "./utils";

// echarts só desce quando o gráfico monta. Vale mais aqui que no sistema
// interno: esta página abre pelo 4G de uma loja, e o histórico de pedidos
// precisa aparecer antes da biblioteca de gráficos terminar de chegar.
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[220px] w-full" />,
});

interface PortalPurchaseChartProps {
  months: PortalMonthTotal[];
}

export function PortalPurchaseChart({ months }: PortalPurchaseChartProps) {
  const option = useMemo(() => buildMonthlyChartOption(months), [months]);

  return <Chart option={option} height={220} />;
}
