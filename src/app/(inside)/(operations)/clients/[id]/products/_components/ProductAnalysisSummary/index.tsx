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
    // Abaixo do desktop são 5 cartões: no celular (2 colunas) e no tablet (3)
    // o último esticaria só metade da linha; ele toma o resto e não sobra buraco.
    <div className="tablet:grid-cols-3 desktop:grid-cols-5 max-tablet:[&>:last-child]:col-span-2 tablet:max-desktop:[&>:last-child]:col-span-2 grid grid-cols-2 gap-8">
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
    </div>
  );
}
