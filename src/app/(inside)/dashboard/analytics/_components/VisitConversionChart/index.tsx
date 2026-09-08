"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { VISIT_CONVERSION_QUERY } from "./gql";
import { VisitConversionResponse } from "./interface";
import { buildVisitConversionOption } from "./utils";

/**
 * O único gráfico da aba que NÃO aceita o recorte por fábrica.
 *
 * A visita é do CLIENTE, não da representada: uma visita cobre várias fábricas
 * de uma vez (ver `visit_item_factories`). Filtrar o numerador (pedidos daquela
 * fábrica) e deixar o denominador com todas as visitas produziria uma taxa de
 * conversão que não é de ninguém — e o servidor nem aceita o argumento, de
 * propósito.
 *
 * Por isso as variáveis são montadas campo a campo em vez de espalhar
 * `filters`: mandar `factoryId` numa operação que não o declara é lixo na
 * requisição, e no dia em que alguém adicionasse a variável à query sem pensar,
 * o número mudaria calado. Quem avisa que o filtro não vale aqui é a descrição
 * do card (ver `SalesTeamSection`).
 */
export function VisitConversionChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(
    () => ({ from: filters.from, to: filters.to, sellerId: filters.sellerId }),
    [filters.from, filters.to, filters.sellerId]
  );
  const { data, loading, error, refetch } =
    useAsyncQuery<VisitConversionResponse>(VISIT_CONVERSION_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.visitConversionByMonth ?? [], [data]);
  const option = useMemo(() => buildVisitConversionOption(points), [points]);

  return (
    <ChartCanvas
      loading={loading}
      hasData={points.length > 0}
      option={option}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
