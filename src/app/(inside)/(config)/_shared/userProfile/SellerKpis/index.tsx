"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ProfileSeller } from "../interface";

interface Props {
  seller: ProfileSeller;
}

export function SellerKpis({ seller }: Props) {
  const revenue = parseFloat(seller.totalRevenue ?? "0");

  // Cor só onde há o que fazer: o verde de "tudo certo" em três dos quatro
  // números pintava a fileira inteira e o olho não achava o que pedia atenção.
  // Dado normal fica no azul neutro do DS; zero sem ação fica cinza; só a
  // falta de fábrica ou de carteira — que trava a rotina — fica em aviso
  // (crítica de configurações, 23/11/2026).
  const kpis = [
    {
      label: "Fábricas com acesso",
      value: String(seller.factoryCount),
      delta: "vínculos ativos",
      status: seller.factoryCount > 0 ? "neutral" : "atencao",
    },
    {
      label: "Carteira de clientes",
      value: String(seller.clientCount),
      delta: "clientes atribuídos",
      status: seller.clientCount > 0 ? "neutral" : "atencao",
    },
    {
      label: "Faturamento total",
      value: formatMoney(seller.totalRevenue),
      delta: "acumulado",
      status: revenue > 0 ? "neutral" : "muted",
    },
    {
      label: "Último pedido",
      value: formatDateDMY(seller.lastOrderDate ?? undefined) || "—",
      delta: "data do pedido mais recente",
      status: seller.lastOrderDate ? "neutral" : "muted",
    },
  ] as const;

  return (
    <Grid cols={{ mobile: 2, desktop: 4 }} gap={8}>
      {kpis.map((kpi) => (
        <Card.Kpi key={kpi.label}>
          <Card.Kpi.Label>{kpi.label}</Card.Kpi.Label>
          {/* Valor numa linha só: "R$ 764.457,34" quebrava entre a moeda e o
              número no celular; o tamanho do valor já encolhe com o cartão. */}
          <Card.Kpi.Value status={kpi.status} className="whitespace-nowrap">
            {kpi.value}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>{kpi.delta}</Card.Kpi.Delta>
        </Card.Kpi>
      ))}
    </Grid>
  );
}
