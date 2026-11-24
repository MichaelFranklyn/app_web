"use client";

import { Card } from "@/components/Card";
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
      size: "md",
      value: String(seller.factoryCount),
      delta: "vínculos ativos",
      status: seller.factoryCount > 0 ? "neutral" : "atencao",
    },
    {
      label: "Carteira de clientes",
      size: "md",
      value: String(seller.clientCount),
      delta: "clientes atribuídos",
      status: seller.clientCount > 0 ? "neutral" : "atencao",
    },
    {
      label: "Faturamento total",
      size: "md",
      value: formatMoney(seller.totalRevenue),
      delta: "acumulado",
      status: revenue > 0 ? "neutral" : "muted",
    },
    {
      label: "Último pedido",
      size: "sm",
      value: formatDateDMY(seller.lastOrderDate ?? undefined) || "—",
      delta: "data do pedido mais recente",
      status: seller.lastOrderDate ? "neutral" : "muted",
    },
  ] as const;

  return (
    <Card.Kpi.Group>
      {kpis.map((kpi) => (
        <Card.Kpi key={kpi.label}>
          <Card.Kpi.Label>{kpi.label}</Card.Kpi.Label>
          {/* Data é texto: vai no tamanho "sm", como em todo cartão de data. */}
          <Card.Kpi.Value status={kpi.status} size={kpi.size}>
            {kpi.value}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>{kpi.delta}</Card.Kpi.Delta>
        </Card.Kpi>
      ))}
    </Card.Kpi.Group>
  );
}
