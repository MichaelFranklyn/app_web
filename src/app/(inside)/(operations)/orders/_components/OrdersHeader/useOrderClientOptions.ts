"use client";

import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useCallback, useMemo } from "react";

import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../../_shared/clientOption";
import {
  CoverageCadence,
  cadenceByClientFrom,
} from "../../../_shared/orderCoverage";
import { ORDER_SELLER_CLIENTS_QUERY } from "./gql";

export interface SellerClientNode {
  clientId: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string | null;
  } | null;
  cadence: CoverageCadence | null;
}

export interface SellerClientsData {
  sellerClientFactoryList: {
    totalCount: number;
    edges: { node: SellerClientNode }[];
  };
}

/**
 * Vínculo sem cliente carregado não vira opção. Com ele fora, o `totalCount`
 * fica maior que a lista e o hook mantém a busca no servidor — o lado seguro do
 * erro: procurar no backend acha o que a página não trouxe.
 */
const getConnection = (data: SellerClientsData) => {
  const connection = data.sellerClientFactoryList;
  return {
    totalCount: connection?.totalCount,
    edges: (connection?.edges ?? []).filter(({ node }) => node.client),
  };
};

const toOption = (node: SellerClientNode) => ({
  value: node.clientId,
  label: clientOptionLabel(node.client!),
  searchText: clientOptionSearchText(node.client!),
});

/** Página da carteira; acima disso a busca passa a ir ao servidor. */
const CLIENTS_PAGE = 50;

/**
 * Os clientes que aquele vendedor atende naquela fábrica, para o select do
 * pedido — com busca no servidor pelo NOME.
 *
 * É a única lista destes modais que pode passar de uma página: vendedores e
 * fábricas são dezenas por empresa, a carteira de um vendedor numa fábrica pode
 * ser milhares. Com página fixa a lista era truncada em silêncio e o cliente que
 * faltava não tinha como ser encontrado; carteira pequena continua filtrando em
 * memória, sem latência (ver `useAsyncSelectOptions`).
 *
 * Mora no pai porque os DOIS modais do cabeçalho — novo pedido e importar
 * pedido — pedem exatamente a mesma lista, com a mesma cadência ao lado.
 */
export function useOrderClientOptions(
  open: boolean,
  sellerId: string,
  factoryId: string
) {
  const clients = useAsyncSelectOptions<SellerClientsData, SellerClientNode>({
    query: ORDER_SELLER_CLIENTS_QUERY,
    getConnection: useCallback(getConnection, []),
    toOption: useCallback(toOption, []),
    searchField: "client_name",
    baseFilters: [
      { field: "seller_id", operator: "eq", value: sellerId },
      { field: "factory_id", operator: "eq", value: factoryId },
    ],
    order: { by: "client_name", dir: "asc" },
    first: CLIENTS_PAGE,
    skip: !open || !sellerId || !factoryId,
  });

  // A cadência de cada cliente vem na MESMA consulta das opções (nenhuma
  // requisição a mais) e alimenta a sugestão de "dura quantos dias na loja":
  // cobre a página carregada, que é onde está o cliente escolhido.
  const cadenceByClient = useMemo(
    () => cadenceByClientFrom(clients.nodes.map((node) => ({ node }))),
    [clients.nodes]
  );

  return {
    options: clients.options,
    /** `undefined` quando a carteira inteira já está na mão (filtro local). */
    onSearch: clients.onSearch,
    loading: clients.loading,
    cadenceByClient,
  };
}
