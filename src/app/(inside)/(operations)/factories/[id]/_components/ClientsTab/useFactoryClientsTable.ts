"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useTableData } from "@/hooks/useTableData";
import { FieldConfig } from "@/hooks/useTableFilters";
import { useMemo } from "react";
import {
  FACTORY_CLIENT_LINKS_QUERY,
  FactoryClientLink,
  FactoryClientLinksData,
  PRICE_TIERS_FOR_LINK_QUERY,
  TiersData,
} from "./gql";
import {
  FACTORY_ORDER_SELLERS_QUERY,
  FactoryOrderSellersData,
} from "../OrdersTab/gql";
import { PRIORITY_ALIASES, PRIORITY_OPTIONS } from "./utils";

export const ITEMS_PER_PAGE = 10;

/**
 * Filtros da aba, traduzidos nas colunas que o backend entende.
 *
 * `client_name` não é coluna do vínculo (que guarda só o `client_id`): o
 * repositório o traduz num `client_id IN (SELECT ...)` sobre razão social e
 * nome fantasia — ver `SellerClientFactoryRepository._apply_filters`.
 */
const FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "client_name" },
  sellerId: { type: "select", queryField: "seller_id" },
  priceTierId: { type: "select", queryField: "price_tier_id" },
  // Vocabulário legado: os vínculos antigos guardam "high"/"medium"/"low".
  // Sem os apelidos, escolher "Alta" no filtro esconderia esses registros — o
  // filtro em memória, que comparava pelo RÓTULO, pegava os dois.
  priority: {
    type: "select",
    queryField: "priority",
    aliases: PRIORITY_ALIASES,
  },
};

/**
 * Por onde a aba pode ser ordenada.
 *
 * Só duas: `client_name`, que o repositório resolve com um join até a tabela de
 * clientes, e `last_invoice_date`, coluna do próprio vínculo. Vendedor e nível
 * de preço ficaram de fora de propósito — no vínculo eles são UUID, e ordenar
 * por eles alinharia a lista por um identificador que ninguém vê. Prioridade
 * também: o valor gravado é texto ("alta", "baixa", "media"), então a ordem
 * seria a alfabética, que põe "baixa" no meio.
 */
const SORTABLE_FIELDS = ["client_name", "last_invoice_date"];

const getSellers = (d: FactoryOrderSellersData) => d.factory_order_sellers;
const getTiers = (d: TiersData) => d.priceTiers;

/**
 * Os clientes de UMA fábrica: página, ordem e filtros resolvidos no BANCO.
 *
 * A aba baixava os 50 primeiros vínculos e fazia o resto em memória — mesma
 * armadilha da aba de pedidos: numa fábrica com carteira grande, "ordenar por
 * cliente" ordenava os 50 baixados, e o filtro de vendedor só oferecia quem
 * aparecia neles. Um cliente da fábrica que ficasse fora dessas 50 linhas não
 * tinha como ser encontrado — nem pela busca, que também era local.
 */
export function useFactoryClientsTable(
  factoryId: string,
  companyFactoryId: string
) {
  const baseFilters = useMemo(
    () => [{ field: "factory_id", value: factoryId }],
    [factoryId]
  );

  const table = useTableData<FactoryClientLinksData, FactoryClientLink>({
    query: FACTORY_CLIENT_LINKS_QUERY,
    fields: FIELDS,
    getConnection: (data) => data.factory_client_links,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: SORTABLE_FIELDS,
    baseFilters,
  });

  // Vendedores com acesso a ESTA fábrica — e não só os que aparecem na página.
  const sellerAccessInput = useMemo(
    () => ({
      filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
    }),
    [factoryId]
  );

  const sellersQuery = useCompleteList<FactoryOrderSellersData>(
    FACTORY_ORDER_SELLERS_QUERY,
    sellerAccessInput,
    getSellers
  );

  const sellerOptions = useMemo<SelectOption[]>(() => {
    const seen = new Map<string, string>();
    sellersQuery.data?.factory_order_sellers?.edges.forEach(({ node }) => {
      if (node.isActive && node.seller)
        seen.set(node.seller.id, node.seller.name);
    });
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [sellersQuery.data]);

  // Níveis de preço desta fábrica (do vínculo com a empresa, não da fábrica
  // global): lista curta, vem inteira.
  const tiersInput = useMemo(
    () => ({
      filters: [
        {
          field: "company_factory_id",
          operator: "eq",
          value: companyFactoryId,
        },
      ],
    }),
    [companyFactoryId]
  );

  const tiersQuery = useCompleteList<TiersData>(
    PRICE_TIERS_FOR_LINK_QUERY,
    tiersInput,
    getTiers,
    { skip: !companyFactoryId }
  );

  const tierOptions = useMemo<SelectOption[]>(
    () =>
      tiersQuery.data?.priceTiers?.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [tiersQuery.data]
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Razão social ou nome fantasia",
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellerOptions,
        loading: sellersQuery.loading,
      },
      {
        type: "select",
        key: "priceTierId",
        label: "Nível de preço",
        placeholder: "Todos os níveis",
        options: tierOptions,
        loading: tiersQuery.loading,
      },
      {
        type: "select",
        key: "priority",
        label: "Prioridade",
        placeholder: "Todas as prioridades",
        options: PRIORITY_OPTIONS,
      },
    ],
    [sellerOptions, sellersQuery.loading, tierOptions, tiersQuery.loading]
  );

  return { ...table, filterFields };
}
