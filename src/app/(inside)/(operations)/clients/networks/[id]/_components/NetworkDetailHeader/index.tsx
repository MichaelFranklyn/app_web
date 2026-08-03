"use client";

import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { StatCard } from "@/components/StatCard";
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
            <PanelHeader.Eyebrow>Rede de clientes</PanelHeader.Eyebrow>
            <PanelHeader.Title>
              {network?.name ?? (loading ? "Carregando…" : "Rede")}
            </PanelHeader.Title>
            {network?.notes && (
              <PanelHeader.Description>{network.notes}</PanelHeader.Description>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 3 }} gap={16}>
        <StatCard label="Lojas na carteira" value={network?.storeCount ?? 0} />
        <StatCard
          label="Faturamento da rede"
          value={formatMoney(network?.invoicedAmount ?? 0)}
          tone="amber"
        />
        <StatCard
          label="Último pedido"
          value={
            network?.lastOrderDate ? formatDate(network.lastOrderDate) : "—"
          }
        />
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
