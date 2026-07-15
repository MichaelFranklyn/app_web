import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo } from "react";

import { SelectOption } from "@/components/Input";

import {
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
  ORDER_ITEM_PRODUCTS_QUERY,
  ORDER_ITEM_TIERS_QUERY,
} from "./gql";
import {
  CompanyFactoriesData,
  PriceListItemsData,
  PriceListsData,
  ProductsData,
  TiersData,
} from "./interface";
import { priceKey } from "./utils";

export interface OrderItemCatalog {
  productOptions: SelectOption[];
  tierOptions: SelectOption[];
  /** Preço sugerido por produto+nível (chave `priceKey`), da tabela ativa. */
  priceMap: Map<string, number>;
  /** Rótulo da embalagem por produto (para nomear preço e quantidade). */
  packLabelByProduct: Map<string, string>;
  /** Múltiplo de venda por produto (0 = sem múltiplo). */
  saleMultipleByProduct: Map<string, number>;
}

/**
 * Resolve o vínculo (`company_factory`) da fábrica escolhida — catálogo, preços
 * e condições de pagamento são todos escopados por esse id, não pela fábrica.
 */
export function useCompanyFactoryId(
  open: boolean,
  factoryId: string | null
): string | null {
  const { data: cfData } = useQuery<CompanyFactoriesData>(
    ORDER_ITEM_COMPANY_FACTORIES_QUERY,
    {
      variables: { input: { first: 200 } },
      skip: !open || !factoryId,
    }
  );

  return useMemo(
    () =>
      cfData?.companyFactories.edges.find((e) => e.node.factoryId === factoryId)
        ?.node.id ?? null,
    [cfData, factoryId]
  );
}

/**
 * Catálogo do item de pedido: resolve o `company_factory` da fábrica e carrega
 * produtos, níveis e a tabela de preço ativa (só para SUGERIR preço), devolvendo
 * as opções e mapas prontos para o formulário. As 5 queries são encadeadas —
 * cada uma só dispara quando a anterior resolveu o id de que depende.
 *
 * Compartilhado entre a criação de pedido (/orders) e a edição de itens no
 * detalhe (/orders/[id]).
 */
export function useOrderItemCatalog(
  open: boolean,
  factoryId: string | null
): OrderItemCatalog {
  // 1) Localiza o company_factory da fábrica deste pedido.
  const companyFactoryId = useCompanyFactoryId(open, factoryId);

  const byCompanyFactory = useMemo(
    () => ({
      first: 1000,
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

  // 2) Todos os produtos da fábrica (catálogo completo, não só os com preço).
  const { data: productsData, fetchMore: fetchMoreProducts } =
    useQuery<ProductsData>(ORDER_ITEM_PRODUCTS_QUERY, {
      variables: { input: byCompanyFactory },
      skip: !open || !companyFactoryId,
    });

  // Catálogos reais passam do `first` de uma página: segue buscando e
  // concatenando até a última página, senão produtos ficam fora do select.
  useEffect(() => {
    const page = productsData?.products.pageInfo;
    if (!page?.hasNextPage || !page.endCursor) return;
    fetchMoreProducts({
      variables: { input: { ...byCompanyFactory, after: page.endCursor } },
      updateQuery: (prev, { fetchMoreResult }) => ({
        products: {
          ...fetchMoreResult.products,
          edges: [...prev.products.edges, ...fetchMoreResult.products.edges],
        },
      }),
    });
  }, [productsData, fetchMoreProducts, byCompanyFactory]);

  // 3) Todos os níveis comerciais da fábrica.
  const { data: tiersData } = useQuery<TiersData>(ORDER_ITEM_TIERS_QUERY, {
    variables: { input: byCompanyFactory },
    skip: !open || !companyFactoryId,
  });

  // 4) Tabela de preço ativa — usada apenas para SUGERIR o preço.
  const { data: priceListsData } = useQuery<PriceListsData>(
    ORDER_ITEM_PRICE_LISTS_QUERY,
    {
      variables: {
        input: {
          first: 100,
          filters: [
            {
              field: "company_factory_id",
              operator: "eq",
              value: companyFactoryId,
            },
          ],
        },
      },
      skip: !open || !companyFactoryId,
    }
  );

  const activePriceListId = useMemo(
    () =>
      priceListsData?.factoryPriceLists.edges.find((e) => e.node.isActive)?.node
        .id ?? null,
    [priceListsData]
  );

  // 5) Itens da tabela ativa — só para o mapa de preços sugeridos.
  const itemsInput = useMemo(
    () => ({
      first: 1000,
      filters: [
        {
          field: "price_list_id",
          operator: "eq",
          value: activePriceListId,
        },
      ],
    }),
    [activePriceListId]
  );

  const { data: itemsData, fetchMore: fetchMoreItems } =
    useQuery<PriceListItemsData>(ORDER_ITEM_PRICE_LIST_ITEMS_QUERY, {
      variables: { input: itemsInput },
      skip: !open || !activePriceListId,
    });

  // A tabela tem produtos × níveis linhas (milhares num catálogo real): pagina
  // até o fim, senão parte dos produtos fica sem preço sugerido ao digitar.
  useEffect(() => {
    const page = itemsData?.priceListItems.pageInfo;
    if (!page?.hasNextPage || !page.endCursor) return;
    fetchMoreItems({
      variables: { input: { ...itemsInput, after: page.endCursor } },
      updateQuery: (prev, { fetchMoreResult }) => ({
        priceListItems: {
          ...fetchMoreResult.priceListItems,
          edges: [
            ...prev.priceListItems.edges,
            ...fetchMoreResult.priceListItems.edges,
          ],
        },
      }),
    });
  }, [itemsData, fetchMoreItems, itemsInput]);

  const products = useMemo(
    () => productsData?.products.edges.map((e) => e.node) ?? [],
    [productsData]
  );

  const productOptions = useMemo<SelectOption[]>(
    () =>
      products.map((p) => ({
        value: p.id,
        // Inclui o código (SKU) no rótulo: o vendedor digita o código e o
        // select filtra por texto do label.
        label: p.sku ? `${p.sku} — ${p.name}` : p.name,
      })),
    [products]
  );

  const tierOptions = useMemo<SelectOption[]>(
    () =>
      tiersData?.priceTiers.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [tiersData]
  );

  // Mapa de preço sugerido por produto+nível (da tabela ativa).
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    (itemsData?.priceListItems.edges ?? []).forEach(({ node }) => {
      if (node.product && node.tier) {
        map.set(
          priceKey(node.product.id, node.tier.id),
          parseFloat(node.unitPrice)
        );
      }
    });
    return map;
  }, [itemsData]);

  const packLabelByProduct = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.unitLabel) map.set(p.id, p.unitLabel.label);
    });
    return map;
  }, [products]);

  const saleMultipleByProduct = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const multiple = Number(p.saleMultiple);
      if (multiple > 0) map.set(p.id, multiple);
    });
    return map;
  }, [products]);

  return {
    productOptions,
    tierOptions,
    priceMap,
    packLabelByProduct,
    saleMultipleByProduct,
  };
}
