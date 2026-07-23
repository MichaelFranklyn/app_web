import { useQuery } from "@apollo/client/react";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useMemo } from "react";

import { SelectOption } from "@/components/Input";

import {
  COMPANY_FACTORIES_FOR_LINK_QUERY,
  PRICE_TIERS_FOR_LINK_QUERY,
  SELLERS_FOR_LINK_QUERY,
  SELLER_CLIENT_FACTORIES_FOR_LINK_QUERY,
  SELLER_FACTORY_ACCESSES_FOR_LINK_QUERY,
} from "./gql";

interface SellersData {
  sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

interface AccessesData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        factoryId: string;
        isActive: boolean;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

interface ClientLinksData {
  sellerClientFactoryList: {
    edges: { node: { id: string; sellerId: string; factoryId: string } }[];
  };
}

interface CompanyFactoriesData {
  companyFactories: {
    edges: { node: { id: string; factoryId: string } }[];
  };
}

interface PriceTiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
  };
}

const LIST_INPUT = { first: 200 };

interface LinkFactoryOptionsArgs {
  open: boolean;
  clientId: string;
  selectedSellerId: string | null;
  selectedFactoryId: string | null;
  /** Vendedor logado: a query de vendedores é admin-only, então é pulada. */
  isSeller: boolean;
}

interface LinkFactoryOptions {
  sellerOptions: SelectOption[];
  /** Fábricas com acesso ativo do vendedor e ainda não vinculadas ao cliente. */
  factoryOptions: SelectOption[];
  /** Níveis de preço do `company_factory` da fábrica selecionada. */
  tierOptions: SelectOption[];
}

/**
 * Carrega e deriva as opções do formulário de vínculo cliente↔fábrica: vendedores
 * ativos, fábricas disponíveis para o vendedor escolhido (com acesso ativo e sem
 * vínculo prévio) e os níveis de preço da fábrica selecionada. Todas as queries
 * só disparam com o modal aberto.
 */
export function useLinkFactoryOptions({
  open,
  clientId,
  selectedSellerId,
  selectedFactoryId,
  isSeller,
}: LinkFactoryOptionsArgs): LinkFactoryOptions {
  const { data: sellersData, error: sellersError } = useQuery<SellersData>(
    SELLERS_FOR_LINK_QUERY,
    {
      variables: { input: LIST_INPUT },
      // Vendedor não lista colegas (query admin-only) e vincula só a si mesmo.
      skip: !open || isSeller,
    }
  );

  const { data: accessesData, error: accessesError } = useQuery<AccessesData>(
    SELLER_FACTORY_ACCESSES_FOR_LINK_QUERY,
    { variables: { input: LIST_INPUT }, skip: !open }
  );

  const { data: clientLinksData, error: clientLinksError } =
    useQuery<ClientLinksData>(SELLER_CLIENT_FACTORIES_FOR_LINK_QUERY, {
      variables: {
        input: {
          first: 200,
          filters: [{ field: "client_id", operator: "eq", value: clientId }],
        },
      },
      skip: !open,
    });

  const { data: companyFactoriesData, error: companyFactoriesError } =
    useQuery<CompanyFactoriesData>(COMPANY_FACTORIES_FOR_LINK_QUERY, {
      variables: { input: LIST_INPUT },
      skip: !open,
    });

  // O company_factory da fábrica selecionada; é dele que pendem os níveis de preço.
  const companyFactoryId = useMemo(
    () =>
      companyFactoriesData?.companyFactories.edges.find(
        ({ node }) => node.factoryId === selectedFactoryId
      )?.node.id ?? null,
    [companyFactoriesData, selectedFactoryId]
  );

  const { data: tiersData, error: tiersError } = useQuery<PriceTiersData>(
    PRICE_TIERS_FOR_LINK_QUERY,
    {
      variables: {
        input: {
          first: 200,
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

  const tierOptions = useMemo<SelectOption[]>(
    () =>
      tiersData?.priceTiers.edges.map(({ node }) => ({
        label: node.name,
        value: node.id,
      })) ?? [],
    [tiersData]
  );

  const sellerOptions = useMemo<SelectOption[]>(
    () =>
      sellersData?.sellers?.edges
        ?.filter(({ node }) => node.isActive)
        .map(({ node }) => ({ label: node.name, value: node.id })) ?? [],
    [sellersData]
  );

  const factoryOptions = useMemo<SelectOption[]>(() => {
    if (!selectedSellerId || !accessesData) return [];

    const existingLinks = new Set(
      (clientLinksData?.sellerClientFactoryList?.edges ?? [])
        .filter(({ node }) => node.sellerId === selectedSellerId)
        .map(({ node }) => node.factoryId)
    );

    return accessesData.sellerFactoryAccessList.edges
      .filter(
        ({ node }) =>
          node.sellerId === selectedSellerId &&
          node.isActive &&
          node.factory &&
          !existingLinks.has(node.factoryId)
      )
      .map(({ node }) => ({
        label: node.factory!.nomeFantasia ?? node.factory!.razaoSocial,
        value: node.factoryId,
      }));
  }, [selectedSellerId, accessesData, clientLinksData]);

  useQueryErrorToast(
    sellersError ??
      accessesError ??
      clientLinksError ??
      companyFactoriesError ??
      tiersError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return { sellerOptions, factoryOptions, tierOptions };
}
