"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { CompanyFactoryDetail } from "../../../interface";
import { formatCommissionRate } from "../../../../utils";

interface Props {
  companyFactory: CompanyFactoryDetail;
}

export function CommercialCard({ companyFactory }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          <span className="inline-flex items-center gap-6">
            Condições comerciais
            <HelpTooltip
              label="O que são as condições comerciais?"
              content={
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Condições comerciais
                  </Title>
                  <Title variant="body-sm">
                    <b>Comissão</b> é o percentual que a sua empresa recebe
                    sobre as vendas desta fábrica. A <b>base de cálculo</b> diz
                    sobre qual valor esse percentual é aplicado.
                  </Title>
                  <Title variant="body-sm" color="muted">
                    O dia de pagamento é quando a fábrica costuma pagar a
                    comissão. O <b>corte do faturamento</b> é o último dia do
                    mês que ainda entra nesse pagamento: o pedido faturado
                    depois dele só é pago no mês seguinte. Para alterar, use o
                    botão Editar no topo da página.
                  </Title>
                </div>
              }
            />
          </span>
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        <Card.Item variant="stat">
          <Card.Item.Label>Comissão</Card.Item.Label>
          <Card.Item.Value color="amber">
            {formatCommissionRate(companyFactory.commissionRate)}
          </Card.Item.Value>
        </Card.Item>
        <Card.Item variant="stat">
          <Card.Item.Label>Base de cálculo</Card.Item.Label>
          <Card.Item.Value>
            {companyFactory.commissionCalcBasis}
          </Card.Item.Value>
        </Card.Item>
        <Card.Item variant="stat">
          <Card.Item.Label>Território</Card.Item.Label>
          <Card.Item.Value>{companyFactory.territory}</Card.Item.Value>
        </Card.Item>
        <Card.Item variant="stat">
          <Card.Item.Label>Dia de pagamento da fábrica</Card.Item.Label>
          <Card.Item.Value>
            Dia {companyFactory.paymentTermDays}
          </Card.Item.Value>
        </Card.Item>
        <Card.Item variant="stat">
          <Card.Item.Label>Corte do faturamento</Card.Item.Label>
          <Card.Item.Value>
            {companyFactory.commissionCutoffDay != null
              ? `Até o dia ${companyFactory.commissionCutoffDay}`
              : "Sem corte"}
          </Card.Item.Value>
        </Card.Item>
        <Card.Item variant="stat">
          <Card.Item.Label>IPI cobrado no pedido</Card.Item.Label>
          <Card.Item.Value>
            {companyFactory.ipiInOrder ? "Sim" : "Não"}
          </Card.Item.Value>
        </Card.Item>
        <Card.Item variant="stat" bordered={false}>
          <Card.Item.Label>Prazo de entrega</Card.Item.Label>
          <Card.Item.Value>
            {companyFactory.deliveryEstimateDays != null
              ? `${companyFactory.deliveryEstimateDays} dia(s)`
              : "—"}
          </Card.Item.Value>
        </Card.Item>
      </Card.Body>
    </Card.Root>
  );
}
