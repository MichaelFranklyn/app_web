import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { PlatformOperation } from "../../interface";
import { positivationRate, visitCompletionRate } from "../../utils";

function Metric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "red" | "amber" | "green";
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <Title
        variant="value"
        weight="semibold"
        color={tone === "default" ? "default" : tone}
      >
        {value}
      </Title>
      <Title variant="micro" color="muted">
        {detail}
      </Title>
    </div>
  );
}

/**
 * A plataforma inteira lida como se fosse um tenant só.
 *
 * Responde "estão trabalhando?", que é diferente de "quantos se cadastraram" —
 * a pergunta que os KPIs de cima respondem. Um mês com muitas empresas novas e
 * poucas visitas realizadas é um problema que só aparece aqui.
 */
export function OperationCard({ operation }: { operation: PlatformOperation }) {
  const positivation = positivationRate(operation);
  const completion = visitCompletionRate(operation);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Operação
        </Card.Header.Title>
        <Card.Header.Description>
          O trabalho de campo somado de todas as empresas, nos últimos 30 dias.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <Grid.Root cols={{ base: 2, tablet: 3, "desktop-xl": 5 }} gap={12}>
          <Grid.Item>
            <Metric
              label="Positivação"
              value={`${positivation}%`}
              detail={`${operation.positivatedClients} de ${operation.activeClients} clientes`}
              tone={
                positivation >= 30
                  ? "green"
                  : positivation >= 15
                    ? "amber"
                    : "red"
              }
            />
          </Grid.Item>

          <Grid.Item>
            <Metric
              label="Visitas realizadas"
              value={`${completion}%`}
              detail={`${operation.visitsDone} de ${operation.visitsPlanned} planejadas`}
              // A rotina é o motor do produto: planejar e não executar é o
              // sintoma que a plataforma inteira precisa enxergar.
              tone={
                completion >= 60 ? "green" : completion >= 25 ? "amber" : "red"
              }
            />
          </Grid.Item>

          <Grid.Item>
            <Metric
              label="Ticket médio"
              value={formatMoney(operation.averageTicket)}
              detail="por pedido de venda"
            />
          </Grid.Item>

          <Grid.Item>
            <Metric
              label="Vendedores ativos"
              value={String(operation.activeSellers)}
              detail="registraram pedido no período"
            />
          </Grid.Item>

          <Grid.Item>
            <Metric
              label="Pedidos por vendedor"
              value={String(operation.ordersPerSeller)}
              detail="média entre os ativos"
            />
          </Grid.Item>
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
