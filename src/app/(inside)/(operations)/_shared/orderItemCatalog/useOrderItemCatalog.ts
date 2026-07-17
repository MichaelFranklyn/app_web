import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { SelectOption } from "@/components/Input";

import {
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_LINKED_TIER_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
  ORDER_ITEM_PRODUCTS_QUERY,
  ORDER_ITEM_TIERS_QUERY,
} from "./gql";
import {
  CompanyFactoriesData,
  LinkedTierData,
  PriceListItemNode,
  PriceListItemsData,
  PriceListsData,
  ProductNode,
  ProductsData,
  TiersData,
} from "./interface";
import { useAllPages } from "./useAllPages";
import { IPI_RULE_NAME, priceKey } from "./utils";

// Seletores no módulo: `useAllPages` os usa na dep list do efeito, então
// precisam ser estáveis entre renders.
const selectProducts = (data: ProductsData) => data?.products;
const selectPriceListItems = (data: PriceListItemsData) => data?.priceListItems;

export interface OrderItemCatalog {
  productOptions: SelectOption[];
  tierOptions: SelectOption[];
  /** A fábrica cobra IPI no pedido (por item), não embutido na tabela de preços. */
  ipiInOrder: boolean;
  /**
   * Preço sugerido POR UNIDADE (peça) por produto+nível (chave `priceKey`).
   * A tabela ativa guarda o preço da embalagem fechada; aqui já vem dividido
   * pelo `unitPerPack` do produto.
   */
  priceMap: Map<string, number>;
  /** Rótulo da unidade de medida por produto (ex.: "Peça", para nomear o preço). */
  unitNameByProduct: Map<string, string>;
  /** Múltiplo de venda por produto, em UNIDADES (saleMultiple × unitPerPack; 0 = sem múltiplo). */
  saleMultipleByProduct: Map<string, number>;
  /** Alíquota de IPI (%) vinculada ao produto; ausente = produto sem IPI. */
  ipiRateByProduct: Map<string, number>;
  /** Níveis que têm preço na tabela ativa, por produto (na ordem de `tierOptions`). */
  pricedTiersByProduct: Map<string, string[]>;
  /** Nível acordado no vínculo deste cliente com esta fábrica; null se não houver. */
  linkedTierId: string | null;
}

/**
 * Resolve o vínculo (`company_factory`) da fábrica escolhida — catálogo, preços
 * e condições de pagamento são todos escopados por esse id, não pela fábrica.
 */
export function useCompanyFactoryNode(
  open: boolean,
  factoryId: string | null
): { id: string; factoryId: string; ipiInOrder: boolean } | null {
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
        ?.node ?? null,
    [cfData, factoryId]
  );
}

export function useCompanyFactoryId(
  open: boolean,
  factoryId: string | null
): string | null {
  return useCompanyFactoryNode(open, factoryId)?.id ?? null;
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
  factoryId: string | null,
  clientId?: string | null
): OrderItemCatalog {
  // 1) Localiza o company_factory da fábrica deste pedido.
  const companyFactoryNode = useCompanyFactoryNode(open, factoryId);
  const companyFactoryId = companyFactoryNode?.id ?? null;
  const ipiInOrder = companyFactoryNode?.ipiInOrder ?? false;

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
  // Catálogos reais passam de uma página — `useAllPages` varre até o fim.
  const { nodes: products } = useAllPages<ProductNode, ProductsData>(
    ORDER_ITEM_PRODUCTS_QUERY,
    open && companyFactoryId ? byCompanyFactory : null,
    selectProducts
  );

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

  // A tabela tem produtos × níveis linhas (1728 numa fábrica real): varre até o
  // fim, senão parte dos produtos fica sem preço sugerido.
  const { nodes: priceItems } = useAllPages<
    PriceListItemNode,
    PriceListItemsData
  >(
    ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
    open && activePriceListId ? itemsInput : null,
    selectPriceListItems
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

  // 6) Nível acordado no vínculo deste cliente com esta fábrica. É o padrão do
  // item; sem ele o vendedor teria de escolher o nível a cada item só para o
  // preço aparecer. Pode não existir em vínculos antigos.
  const { data: linkedTierData } = useQuery<LinkedTierData>(
    ORDER_ITEM_LINKED_TIER_QUERY,
    {
      variables: {
        input: {
          first: 1,
          filters: [
            { field: "client_id", operator: "eq", value: clientId },
            { field: "factory_id", operator: "eq", value: factoryId },
          ],
        },
      },
      skip: !open || !clientId || !factoryId,
    }
  );

  // O nível do vínculo é uma conveniência: se a query falhar ou o vínculo não
  // tiver nível, o item segue sem sugestão em vez de derrubar a tela.
  const linkedTierId =
    linkedTierData?.sellerClientFactoryList?.edges?.[0]?.node.priceTierId ??
    null;

  // Mapa de preço sugerido por produto+nível (da tabela ativa), POR UNIDADE:
  // a tabela guarda o preço da embalagem fechada, o pedido trabalha em peças.
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    priceItems.forEach((node) => {
      if (node.product && node.tier) {
        const perPack = Number(node.product.unitPerPack) || 1;
        map.set(
          priceKey(node.product.id, node.tier.id),
          parseFloat(node.unitPrice) / perPack
        );
      }
    });
    return map;
  }, [priceItems]);

  // Níveis que têm preço para cada produto, na ordem de `tierOptions`. Serve
  // para escolher o nível sozinho quando o produto só é vendido em um deles.
  const pricedTiersByProduct = useMemo(() => {
    const map = new Map<string, string[]>();
    tierOptions.forEach(({ value: tierId }) => {
      products.forEach((p) => {
        if (!priceMap.has(priceKey(p.id, tierId))) return;
        const tiers = map.get(p.id);
        if (tiers) tiers.push(tierId);
        else map.set(p.id, [tierId]);
      });
    });
    return map;
  }, [products, tierOptions, priceMap]);

  // IPI vinculado ao produto (import da tabela, modelo de pedido ou cadastro
  // manual). Só a regra "IPI" com cálculo por alíquota — ST/ICMS entram no
  // preço da tabela, não como imposto do item.
  const ipiRateByProduct = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const ipi = p.taxes?.find(
        (t) =>
          t.taxRule?.name.toUpperCase() === IPI_RULE_NAME &&
          t.calcType === "RATE"
      );
      if (!ipi) return;
      const rate = parseFloat(ipi.rate);
      if (rate > 0) map.set(p.id, rate);
    });
    return map;
  }, [products]);

  const unitNameByProduct = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.unit) map.set(p.id, p.unit.label);
    });
    return map;
  }, [products]);

  // Múltiplo de venda em UNIDADES: o produto cadastra o múltiplo em embalagens,
  // então o passo efetivo em peças é saleMultiple × unitPerPack.
  const saleMultipleByProduct = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const multiple = Number(p.saleMultiple);
      const perPack = Number(p.unitPerPack) || 1;
      if (multiple > 0) map.set(p.id, multiple * perPack);
    });
    return map;
  }, [products]);

  return {
    productOptions,
    tierOptions,
    ipiInOrder,
    priceMap,
    unitNameByProduct,
    saleMultipleByProduct,
    ipiRateByProduct,
    pricedTiersByProduct,
    linkedTierId,
  };
}
