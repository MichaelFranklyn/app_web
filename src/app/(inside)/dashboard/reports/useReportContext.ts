"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { DASHBOARD_FACTORIES_QUERY, DASHBOARD_SELLERS_QUERY } from "../gql";
import {
  DashboardFactoriesResponse,
  DashboardSellersResponse,
} from "../interface";
import { formatDateRangeLabel } from "../utils";
import { ReportFilters } from "./interface";
import { buildReportContextLines } from "./reportContextLines";

/**
 * O recorte do relatório escrito por extenso, para o cabeçalho do documento.
 *
 * Um relatório de um vendedor impresso sem dizer isso passa por "a empresa
 * toda" — e é assim que uma reunião discute o número errado. Por isso o NOME do
 * vendedor, não o id: no papel, um UUID não informa ninguém.
 *
 * A mesma coisa vale para a FÁBRICA: uma curva ABC de uma representada impressa
 * sem dizer qual é lida como a carteira inteira, e o número de concentração
 * muda completamente entre as duas leituras.
 *
 * As queries são as mesmas da barra de filtros e saem do cache do Apollo; não
 * custam uma segunda ida à rede.
 */
export const useReportContext = (filters: ReportFilters) => {
  const { data } = useQuery<DashboardSellersResponse>(DASHBOARD_SELLERS_QUERY, {
    variables: { input: { first: 200 } },
    skip: !filters.sellerId,
    fetchPolicy: "cache-and-network",
  });

  const sellerName = useMemo(() => {
    if (!filters.sellerId) return null;
    const sellers =
      data?.dashboard_sellers?.edges.map((edge) => edge.node) ?? [];
    return (
      sellers.find((seller) => seller.id === filters.sellerId)?.name ?? null
    );
  }, [data, filters.sellerId]);

  const { data: factoriesData } = useQuery<DashboardFactoriesResponse>(
    DASHBOARD_FACTORIES_QUERY,
    {
      variables: { input: { first: 200 } },
      skip: !filters.factoryId,
      fetchPolicy: "cache-and-network",
    }
  );

  const factoryName = useMemo(() => {
    if (!filters.factoryId) return null;
    const nodes = factoriesData?.dashboard_factories?.edges ?? [];
    const achado = nodes
      .map((edge) => edge.node)
      .find((node) => node.factory?.id === filters.factoryId);
    if (!achado?.factory) return null;
    // O apelido do vínculo primeiro: é o nome pelo qual a casa reconhece a
    // representada, e é o que aparece no seletor que a pessoa acabou de usar.
    return (
      achado.nickname ||
      achado.factory.nomeFantasia ||
      achado.factory.razaoSocial
    );
  }, [factoriesData, filters.factoryId]);

  const context = useMemo(
    () =>
      buildReportContextLines({
        periodLabel: formatDateRangeLabel(filters.from, filters.to),
        sellerName,
        factoryName,
        hasFactoryFilter: filters.factoryId !== null,
      }),
    [filters.from, filters.to, sellerName, filters.factoryId, factoryName]
  );

  return { context, sellerName, factoryName };
};
