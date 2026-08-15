import { Card } from "@/components/Card";
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
    <section className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-3 gap-[8px]">
        <Kpi label="Total comprado" value={formatMoney(summary.totalAmount)} />
        <Kpi label="Pedidos" value={String(summary.orderCount)} />
        <Kpi
          label="Média por pedido"
          value={formatMoney(summary.averageTicket)}
        />
      </div>

      <Card.Root className="h-auto p-[16px]">
        <div className="mb-[8px] flex flex-col gap-[2px]">
          <Title variant="heading-sm">Compras por mês</Title>
          <Title variant="body-xs" color="muted">
            Últimos 12 meses, incluindo os meses sem compra.
          </Title>
        </div>
        <PortalPurchaseChart months={summary.months} />
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
    <Card.Root className="h-auto p-[12px]">
      <div className="flex flex-col gap-[4px]">
        <Title variant="label" color="muted">
          {label}
        </Title>
        {/* `value` e não `kpi`: três valores de moeda lado a lado no celular
            estouram a coluna no tamanho maior. */}
        <Title variant="value" className="break-words">
          {value}
        </Title>
      </div>
    </Card.Root>
  );
}
