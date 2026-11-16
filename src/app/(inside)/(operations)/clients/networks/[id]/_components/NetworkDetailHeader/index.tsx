"use client";

import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";

import { ClientNetwork } from "../../../interface";

interface Props {
  network: ClientNetwork | null;
  loading: boolean;
}

/**
 * Identificação da rede e o consolidado das lojas.
 *
 * Os três números são a razão de a rede existir: sem eles, "quanto esse grupo
 * comprou" só se responde somando loja por loja na mão.
 */
export function NetworkDetailHeader({ network, loading }: Props) {
  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow color="green">
              Rede de clientes
            </PanelHeader.Eyebrow>
            <PanelHeader.Heading {...PAGE_HEADING.networks}>
              {network?.name ?? (loading ? "Carregando…" : "Rede")}
            </PanelHeader.Heading>
            {network?.notes && (
              <PanelHeader.Description>{network.notes}</PanelHeader.Description>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 2, tablet: 3 }} gap={16}>
        <Card.Kpi>
          <Card.Kpi.Label>Lojas na carteira</Card.Kpi.Label>
          <Card.Kpi.Value>{network?.storeCount ?? 0}</Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>Faturamento da rede</Card.Kpi.Label>
          <Card.Kpi.Value>
            {formatMoney(network?.invoicedAmount ?? 0)}
          </Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>Último pedido</Card.Kpi.Label>
          <Card.Kpi.Value>
            {network?.lastOrderDate ? formatDate(network.lastOrderDate) : "—"}
          </Card.Kpi.Value>
        </Card.Kpi>
      </Grid.Root>

      {network && network.storeCount === 0 && (
        <Title variant="body-sm" color="muted">
          Nenhuma loja ligada a esta rede ainda. Abra a ficha de um cliente na
          carteira e escolha esta rede para ele aparecer aqui.
        </Title>
      )}
    </>
  );
}
