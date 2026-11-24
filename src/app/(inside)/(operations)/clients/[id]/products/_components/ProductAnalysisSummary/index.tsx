"use client";

import { Card } from "@/components/Card";

import { ProductAnalysisSummaryData } from "../../interface";

interface Props {
  data: ProductAnalysisSummaryData;
}

/**
 * Os números do topo, na ordem da conversa de venda: o que sumiu, o que
 * atrasou, o que está na hora — e só depois o tamanho da cesta.
 */
export function ProductAnalysisSummary({ data }: Props) {
  return (
    // Cinco cartões: Card.Kpi.Group põe 5 numa linha no desktop e, abaixo
    // dele, estica o último para não sobrar buraco.
    <Card.Kpi.Group>
      <Card.Kpi>
        <Card.Kpi.Label>Parou de comprar</Card.Kpi.Label>
        {/* Tom em todos, não só em dois: o número sem cor lia-se como "ok"
            mesmo quando o cliente largou produtos (crítica de 23/11/2026). */}
        <Card.Kpi.Value status={data.stopped > 0 ? "atencao" : "muted"}>
          {data.stopped}
        </Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Atrasados</Card.Kpi.Label>
        <Card.Kpi.Value status={data.late > 0 ? "urgente" : "muted"}>
          {data.late}
        </Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Hora de repor</Card.Kpi.Label>
        <Card.Kpi.Value status={data.due > 0 ? "atencao" : "muted"}>
          {data.due}
        </Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Compra sempre</Card.Kpi.Label>
        <Card.Kpi.Value status={data.always > 0 ? "ok" : "muted"}>
          {data.always}
        </Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Produtos já comprados</Card.Kpi.Label>
        <Card.Kpi.Value>{data.total}</Card.Kpi.Value>
      </Card.Kpi>
    </Card.Kpi.Group>
  );
}
