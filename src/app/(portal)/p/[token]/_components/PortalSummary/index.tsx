import { Card } from "@/components/Card";
import { formatMoney } from "@/utils/format/masks";
import { PortalPurchaseSummary } from "../../interface";
import { PortalFactorySplit } from "../PortalFactorySplit";
import { PortalPurchaseChart } from "../PortalPurchaseChart";

interface PortalSummaryProps {
  summary: PortalPurchaseSummary;
}

/**
 * O retrato das compras, em três números e um gráfico.
 *
 * Os números vêm antes do gráfico de propósito: "quanto eu já comprei aqui" é
 * respondido por um valor, não por uma forma. O gráfico serve à pergunta
 * seguinte — como isso se distribuiu no tempo.
 */
export function PortalSummary({ summary }: PortalSummaryProps) {
  if (summary.orderCount === 0) return null;

  return (
    <section className="flex flex-col gap-20">
      {/* Os mesmos cartões de número das telas do sistema (Card.Kpi.Group). */}
      <Card.Kpi.Group>
        <Kpi label="Total comprado" value={formatMoney(summary.totalAmount)} />
        <Kpi label="Pedidos" value={String(summary.orderCount)} />
        <Kpi
          label="Média por pedido"
          value={formatMoney(summary.averageTicket)}
        />
      </Card.Kpi.Group>

      <Card.Root className="h-auto">
        <Card.Header>
          <Card.Header.Title>Compras por mês</Card.Header.Title>
          <Card.Header.Description>
            Últimos 12 meses, incluindo os meses sem compra.
          </Card.Header.Description>
        </Card.Header>
        <Card.Body>
          <PortalPurchaseChart months={summary.months} />
        </Card.Body>
      </Card.Root>

      <PortalFactorySplit
        factories={summary.factories}
        totalAmount={summary.totalAmount}
      />
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card.Kpi>
      <Card.Kpi.Label>{label}</Card.Kpi.Label>
      <Card.Kpi.Value>{value}</Card.Kpi.Value>
    </Card.Kpi>
  );
}
