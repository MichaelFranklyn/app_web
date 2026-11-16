import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
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
    <section className="flex flex-col gap-[20px]">
      {/* Os mesmos cartões de número das telas do sistema. Três colunas só a
          partir do tablet: em 320px cada cartão ficava estreito demais para o
          rótulo. */}
      <Grid.Root cols={{ base: 2, tablet: 3 }} gap={20}>
        <Grid.Item>
          <Kpi
            label="Total comprado"
            value={formatMoney(summary.totalAmount)}
          />
        </Grid.Item>
        <Grid.Item>
          <Kpi label="Pedidos" value={String(summary.orderCount)} />
        </Grid.Item>
        <Grid.Item>
          <Kpi
            label="Média por pedido"
            value={formatMoney(summary.averageTicket)}
          />
        </Grid.Item>
      </Grid.Root>

      <Card.Root className="h-auto">
        <Card.Body padding="compact">
          <div className="mb-[8px] flex flex-col gap-[2px]">
            <Title variant="heading-sm">Compras por mês</Title>
            <Title variant="body-xs" color="muted">
              Últimos 12 meses, incluindo os meses sem compra.
            </Title>
          </div>
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
      {/* `break-words`: três valores de moeda lado a lado no celular. */}
      <Card.Kpi.Value className="break-words">{value}</Card.Kpi.Value>
    </Card.Kpi>
  );
}
