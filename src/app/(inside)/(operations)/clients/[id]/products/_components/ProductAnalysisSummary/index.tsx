"use client";

import { StatCard } from "@/components/StatCard";

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
    <div className="tablet:grid-cols-3 desktop:grid-cols-5 grid grid-cols-2 gap-8">
      <StatCard label="Parou de comprar" value={data.stopped} tone="muted" />
      <StatCard label="Atrasados" value={data.late} tone="red" />
      <StatCard label="Hora de repor" value={data.due} tone="amber" />
      <StatCard label="Compra sempre" value={data.always} tone="green" />
      <StatCard label="Produtos já comprados" value={data.total} />
    </div>
  );
}
