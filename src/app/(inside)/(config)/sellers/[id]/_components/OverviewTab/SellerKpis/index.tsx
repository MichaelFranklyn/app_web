"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { SellerDetail } from "../../../interface";

interface Props {
  seller: SellerDetail;
}

export function SellerKpis({ seller }: Props) {
  const revenue = parseFloat(seller.totalRevenue ?? "0");

  const kpis = [
    {
      label: "Fábricas com acesso",
      value: String(seller.factoryCount),
      delta: "vínculos ativos",
      status: seller.factoryCount > 0 ? "ok" : "urgente",
    },
    {
      label: "Carteira de clientes",
      value: String(seller.clientCount),
      delta: "clientes atribuídos",
      status: seller.clientCount > 0 ? "ok" : "atencao",
    },
    {
      label: "Faturamento total",
      value: formatMoney(seller.totalRevenue),
      delta: "acumulado",
      status: revenue > 0 ? "ok" : "neutral",
    },
    {
      label: "Último pedido",
      value: formatDateDMY(seller.lastOrderDate ?? undefined) || "—",
      delta: "data do pedido mais recente",
      status: seller.lastOrderDate ? "neutral" : "atencao",
    },
  ] as const;

  return (
    <Grid cols={{ mobile: 2, desktop: 2 }} gap={8}>
      {kpis.map((kpi) => (
        <Card.Kpi key={kpi.label}>
          <Card.Kpi.Label>{kpi.label}</Card.Kpi.Label>
          <Card.Kpi.Value status={kpi.status}>{kpi.value}</Card.Kpi.Value>
          <Card.Kpi.Delta>{kpi.delta}</Card.Kpi.Delta>
        </Card.Kpi>
      ))}
    </Grid>
  );
}
