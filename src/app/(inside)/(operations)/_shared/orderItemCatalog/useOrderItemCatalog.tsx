import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { SelectOption } from "@/components/Input";
import { ProductThumb } from "@/components/ProductThumb";

import {
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_LINKED_TIER_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
  ORDER_ITEM_PRODUCT_OPTIONS_QUERY,
  ORDER_ITEM_PRODUCTS_QUERY,
  ORDER_ITEM_TIERS_QUERY,
} from "./gql";
import {
  CompanyFactoriesData,
  LinkedTierData,
  PriceListItemsData,
  PriceListsData,
  ProductNode,
  ProductOptionNode,
  ProductOptionsData,
  ProductsData,
  TiersData,
} from "./interface";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { IPI_RULE_NAME, priceKey } from "./utils";

/**
 * Rótulo e miniatura da opção de produto. Vive no módulo porque
 * `useAsyncSelectOptions` o usa em dep list — recriá-lo a cada render refaria a
 * lista de opções sem motivo.
 */
const toProductOption = (node: ProductOptionNode): SelectOption => ({
  value: node.id,
  // Inclui o código (SKU) no rótulo: o vendedor digita o código e a busca do
  // backend casa em `name,sku`.
  label: node.sku ? `${node.sku} — ${node.name}` : node.name,
  // A foto ajuda a achar o item na lista e serve para mostrar o produto ao
  // cliente na tela, durante a visita.
  startIcon: (
    <ProductThumb imageUrl={node.imageUrl} name={node.name} size="xs" />
  ),
});

const getProductsConnection = (data: ProductOptionsData) => data?.products;

/** Quantas opções o select traz por busca. */
const PRODUCT_PAGE_SIZE = 25;

export interface OrderItemCatalog {
  /** Uma página do catálogo, já filtrada pelo termo digitado. */
  productOptions: SelectOption[];
  /** Repassa o termo ao backend (modo assíncrono do select, com debounce). */
  /** `undefined` quando o catálogo inteiro coube na primeira página (filtro local). */
  onProductSearch?: (term: string) => void;
  /** Busca de opções em andamento — alimenta o `loading` do select. */
  isLoadingProducts: boolean;
  /**
   * A fábrica tem catálogo. Não é `productOptions.length > 0`: a lista mostra o
   * resultado da BUSCA, e uma busca sem resultado não significa fábrica sem
   * produto — significa que aquele termo não achou nada.
   */
  hasProducts: boolean;
  /**
   * Opção dos produtos JÁ ESCOLHIDOS. O select mostra uma página por vez, então
   * um produto do pedido pode não estar em `productOptions` — quem precisa
   * exibir o item escolhido lê daqui.
   */
  productOptionById: Map<string, SelectOption>;
  /**
   * Produtos cujo nó completo já chegou. É o sinal de "os dados deste produto
   * carregaram", que antes era lido de `productOptions.length`.
   */
  loadedProductIds: Set<string>;
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
  /** Produto+nível (chave `priceKey`) com promoção relâmpago ativa hoje. */
  promoActiveKeys: Set<string>;
  /** Nível acordado no vínculo deste cliente com esta fábrica; null se não houver. */
  linkedTierId: string | null;
}

/**
 * Resolve o vínculo (`company_factory`) da fábrica escolhida — catálogo, preços
 * e condições de pagamento são todos escopados por esse id, não pela fábrica.
 */
/** O nó como ele vem da query — derivado, não redigitado: a assinatura já
 *  divergiu do `select` uma vez, e campo novo na query ficava invisível aqui. */
type CompanyFactoryNode =
  CompanyFactoriesData["companyFactories"]["edges"][number]["node"];

export function useCompanyFactoryNode(
  open: boolean,
  factoryId: string | null
): CompanyFactoryNode | null {
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
 * Catálogo do item de pedido: resolve o `company_factory` da fábrica, oferece a
 * busca de produtos e carrega — só para os produtos ESCOLHIDOS — a unidade, o
 * múltiplo de venda, o IPI e o preço da tabela ativa (que apenas SUGERE o
 * preço).
 *
 * A escolha do produto é uma BUSCA no servidor, não uma lista em memória: o
 * catálogo de uma fábrica real passa de mil itens e varrê-lo inteiro (produtos
 * + a tabela de preços, que tem produtos × níveis linhas) era o que fazia o
 * modal de item demorar a responder. Como o pedido usa alguns produtos, os
 * dados de apoio vêm por `id in [...]` — completos para todos os itens do
 * pedido, sem trazer o resto.
 *
 * `selectedProductIds` são os produtos que precisam de dado de apoio: o que
 * está no formulário e os que já entraram no pedido.
 *
 * Compartilhado entre a criação de pedido (/orders) e a edição de itens no
 * detalhe (/orders/[id]).
 */
export function useOrderItemCatalog(
  open: boolean,
  factoryId: string | null,
  clientId?: string | null,
  selectedProductIds: readonly string[] = []
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

  // 2) Opções do select: uma página do catálogo da fábrica, filtrada no
  // servidor pelo que o vendedor digita (nome ou código).
  const productScope = useMemo(
    () => [
      {
        field: "company_factory_id",
        operator: "eq",
        value: companyFactoryId ?? "",
      },
    ],
    [companyFactoryId]
  );

  const {
    options: productOptions,
    loading: isLoadingProducts,
    onSearch: onProductSearch,
  } = useAsyncSelectOptions<ProductOptionsData, ProductOptionNode>({
    query: ORDER_ITEM_PRODUCT_OPTIONS_QUERY,
    getConnection: getProductsConnection,
    toOption: toProductOption,
    searchField: "name,sku",
    baseFilters: productScope,
    first: PRODUCT_PAGE_SIZE,
    skip: !open || !companyFactoryId,
  });

  // Uma vez que a busca trouxe produtos, a fábrica tem catálogo — e continua
  // tendo depois de um termo que não acha nada. Zera ao trocar de fábrica.
  const [hasProducts, setHasProducts] = useState(false);

  useEffect(() => {
    setHasProducts(false);
  }, [companyFactoryId]);

  useEffect(() => {
    if (productOptions.length > 0) setHasProducts(true);
  }, [productOptions.length]);

  // Ids em ordem estável e sem repetição: eles entram nas variables de duas
  // queries, e a mesma seleção em outra ordem seria outra entrada de cache.
  const selectedIdsKey = useMemo(
    () => Array.from(new Set(selectedProductIds)).sort().join(","),
    [selectedProductIds]
  );
  const selectedIds = useMemo(
    () => (selectedIdsKey ? selectedIdsKey.split(",") : []),
    [selectedIdsKey]
  );
  const hasSelection = selectedIds.length > 0;

  // 3) Nó completo dos produtos escolhidos: unidade, múltiplo de venda e IPI.
  const { data: selectedProductsData } = useQuery<ProductsData>(
    ORDER_ITEM_PRODUCTS_QUERY,
    {
      variables: {
        input: {
          first: selectedIds.length || 1,
          filters: [
            {
              field: "company_factory_id",
              operator: "eq",
              value: companyFactoryId,
            },
            { field: "id", operator: "in", values: selectedIds },
          ],
        },
      },
      skip: !open || !companyFactoryId || !hasSelection,
    }
  );

  const products = useMemo<ProductNode[]>(
    () => selectedProductsData?.products.edges.map((e) => e.node) ?? [],
    [selectedProductsData]
  );

  // 4) Todos os níveis comerciais da fábrica (são poucos, cabem numa página).
  const { data: tiersData } = useQuery<TiersData>(ORDER_ITEM_TIERS_QUERY, {
    variables: { input: byCompanyFactory },
    skip: !open || !companyFactoryId,
  });

  // 5) Tabela de preço ativa — usada apenas para SUGERIR o preço.
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
      // A tabela de preço é mantida na tela da fábrica; quem monta o pedido só
      // lê. `cache-first` servia a tabela de ontem para o pedido de hoje.
      fetchPolicy: "cache-and-network",
    }
  );

  const activePriceListId = useMemo(
    () =>
      priceListsData?.factoryPriceLists.edges.find((e) => e.node.isActive)?.node
        .id ?? null,
    [priceListsData]
  );

  // 6) Preços da tabela ativa para os produtos escolhidos — uma linha por nível
  // de cada produto, não a tabela inteira.
  const { data: priceItemsData } = useQuery<PriceListItemsData>(
    ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
    {
      variables: {
        input: {
          first: 1000,
          filters: [
            {
              field: "price_list_id",
              operator: "eq",
              value: activePriceListId,
            },
            { field: "product_id", operator: "in", values: selectedIds },
          ],
        },
      },
      skip: !open || !activePriceListId || !hasSelection,
      // Mesmo motivo da tabela acima: o preço é editado noutra tela.
      fetchPolicy: "cache-and-network",
    }
  );

  const priceItems = useMemo(
    () => priceItemsData?.priceListItems.edges.map((e) => e.node) ?? [],
    [priceItemsData]
  );

  const tierOptions = useMemo<SelectOption[]>(
    () =>
      tiersData?.priceTiers.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [tiersData]
  );

  // Rótulo e miniatura dos produtos escolhidos: o select mostra uma página por
  // vez, e o item do pedido tem de continuar legível depois de a busca mudar.
  const productOptionById = useMemo(() => {
    const map = new Map<string, SelectOption>();
    products.forEach((p) => map.set(p.id, toProductOption(p)));
    return map;
  }, [products]);

  const loadedProductIds = useMemo(
    () => new Set(products.map((p) => p.id)),
    [products]
  );

  // 7) Nível acordado no vínculo deste cliente com esta fábrica. É o padrão do
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
  // Usa `effectiveUnitPrice`: já vem o preço promocional quando a promoção
  // relâmpago está ativa hoje (senão, o preço normal da tabela).
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    priceItems.forEach((node) => {
      if (node.product && node.tier) {
        const perPack = Number(node.product.unitPerPack) || 1;
        map.set(
          priceKey(node.product.id, node.tier.id),
          parseFloat(node.effectiveUnitPrice) / perPack
        );
      }
    });
    return map;
  }, [priceItems]);

  // Produto+nível em promoção relâmpago hoje — o formulário do item marca o
  // item como promocional e exibe o selo "⚡ Promoção relâmpago".
  const promoActiveKeys = useMemo(() => {
    const set = new Set<string>();
    priceItems.forEach((node) => {
      if (node.isPromoActive && node.product && node.tier) {
        set.add(priceKey(node.product.id, node.tier.id));
      }
    });
    return set;
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
    onProductSearch,
    isLoadingProducts,
    hasProducts,
    productOptionById,
    loadedProductIds,
    tierOptions,
    ipiInOrder,
    priceMap,
    unitNameByProduct,
    saleMultipleByProduct,
    ipiRateByProduct,
    pricedTiersByProduct,
    promoActiveKeys,
    linkedTierId,
  };
}
