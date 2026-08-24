"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { formatMoney } from "@/utils/format/masks";

import { Insight } from "../../interface";
import { totalAmount, totalCases, urgentCount } from "../../utils";

/**
 * A leitura em quatro números, antes dos cartões.
 *
 * Serve para a pergunta que se faz de pé, olhando o celular entre uma visita e
 * outra: "tem muita coisa? tem coisa urgente? quanto dinheiro está parado?".
 * Quem só tem trinta segundos lê a faixa e volta depois; quem tem quinze
 * minutos desce e resolve.
 */
export function InsightsSummary({ insights }: { insights: Insight[] }) {
  const urgent = urgentCount(insights);
  const money = totalAmount(insights);
  const cases = totalCases(insights);

  return (
    <Grid.Root cols={{ base: 2, "desktop-xl": 4 }} gap={12}>
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Pendências</Card.Kpi.Label>
          <Card.Kpi.Value status="neutral">{insights.length}</Card.Kpi.Value>
          <Card.Kpi.Delta>assuntos abertos agora</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Para hoje</Card.Kpi.Label>
          <Card.Kpi.Value status={urgent > 0 ? "urgente" : "ok"}>
            {urgent}
          </Card.Kpi.Value>
          <Card.Kpi.Delta negative={urgent > 0}>
            {urgent > 0 ? "custam dinheiro esperando" : "nada urgente"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>
            Dinheiro parado
            <HelpTooltip
              label="O que entra nesta soma?"
              content="Boleto vencido, pedido confirmado que a fábrica ainda não faturou, rascunho sem fechar e o que falta para as metas do mês. É o valor que já está em jogo — não é previsão de venda nova."
            />
          </Card.Kpi.Label>
          <Card.Kpi.Value status={money > 0 ? "atencao" : "neutral"}>
            {formatMoney(money)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>somado das pendências com valor</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Casos</Card.Kpi.Label>
          <Card.Kpi.Value status="neutral" className="text-(--blue)!">
            {cases}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>clientes, pedidos e boletos somados</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
    </Grid.Root>
  );
}
