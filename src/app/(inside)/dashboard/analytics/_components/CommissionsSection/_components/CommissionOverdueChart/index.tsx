"use client";

import { useMemo } from "react";

import { ChartFilters } from "../../../../interface";
import { ChartCanvas } from "../../../ChartCanvas";
import { useCommissionRows } from "../../useCommissionRows";
import { todayIso } from "../../utils";
import { buildCommissionOverdueOption, overdueByFactory } from "./utils";

/** "Qual fábrica está devendo comissão e há quanto tempo." */
export function CommissionOverdueChart({ filters }: { filters: ChartFilters }) {
  const { rows, loading, error, refetch } = useCommissionRows(filters);

  const factories = useMemo(() => overdueByFactory(rows, todayIso()), [rows]);
  const option = useMemo(
    () => buildCommissionOverdueOption(factories),
    [factories]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={factories.length > 0}
      option={option}
      error={error}
      onRetry={refetch}
      // Vazio aqui é boa notícia: o texto padrão ("ajuste o período") faria
      // parecer que falta dado, quando na verdade não falta comissão.
      emptyTitle="Nenhuma comissão atrasada"
      emptyDescription="Tudo que está a receber no período ainda está no prazo de pagamento da fábrica."
    />
  );
}
