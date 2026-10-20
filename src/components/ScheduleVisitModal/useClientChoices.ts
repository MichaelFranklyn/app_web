"use client";

import { SelectOption } from "@/components/Input";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useCompleteList } from "@/hooks/useCompleteList";
import { clientDisplayName } from "@/utils/client";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import {
  COMPANY_CLIENTS_FOR_VISIT_QUERY,
  WALLET_CLIENTS_FOR_VISIT_QUERY,
  CLIENT_ORDERS_FOR_VISIT_QUERY,
} from "./gql";
import {
  ClientOrdersQueryResponse,
  CompanyClientNode,
  CompanyClientsQueryResponse,
  WalletClientsQueryResponse,
} from "./interface";
import { orderLabel } from "./utils";

/** Quantos pedidos recentes entram no select. */
const RECENT_ORDERS = 20;

const getWallet = (d: WalletClientsQueryResponse) => d.sellerClientFactoryList;
const getCompanyClients = (d: CompanyClientsQueryResponse) =>
  d.schedule_clients;
const toCompanyOption = (node: CompanyClientNode): SelectOption => ({
  value: node.client?.id ?? node.id,
  label: clientDisplayName(node.client),
});

interface Params {
  open: boolean;
  /** Cliente fixado pela tela: não há lista a oferecer. */
  isClientFixed: boolean;
  /** A rota de quem vai fazer. Nulo = agenda de quem não vende. */
  sellerId: string | null;
  /** Agenda ainda indefinida (o gestor não escolheu): nada a listar. */
  hasOwner: boolean;
  clientId: string | null;
  /** Pedido fixado pela tela: não há lista de pedidos a oferecer. */
  isOrderFixed: boolean;
}

/**
 * Os clientes que a agenda escolhida pode receber, e os pedidos recentes do
 * cliente escolhido.
 *
 * Quem vende recebe os da CARTEIRA dele (visitar cliente de outro é dar a ele
 * a carteira alheia); quem não vende — o escritório — liga para qualquer
 * cliente da empresa, com busca no servidor.
 */
export function useClientChoices({
  open,
  isClientFixed,
  sellerId,
  hasOwner,
  clientId,
  isOrderFixed,
}: Params) {
  const listClients = open && !isClientFixed && hasOwner;

  const walletInput = useMemo(
    () => ({
      filters: [{ field: "seller_id", operator: "eq", value: sellerId ?? "" }],
    }),
    [sellerId]
  );
  const wallet = useCompleteList<WalletClientsQueryResponse>(
    WALLET_CLIENTS_FOR_VISIT_QUERY,
    walletInput,
    getWallet,
    { skip: !listClients || !sellerId }
  );
  const company = useAsyncSelectOptions<
    CompanyClientsQueryResponse,
    CompanyClientNode
  >({
    query: COMPANY_CLIENTS_FOR_VISIT_QUERY,
    getConnection: getCompanyClients,
    toOption: toCompanyOption,
    searchField: "search",
    skip: !listClients || Boolean(sellerId),
  });

  const walletOptions = useMemo<SelectOption[]>(() => {
    const seen = new Map<string, string>();
    (wallet.data?.sellerClientFactoryList?.edges ?? []).forEach(({ node }) => {
      if (node.client && !seen.has(node.client.id)) {
        seen.set(node.client.id, clientDisplayName(node.client));
      }
    });
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [wallet.data]);

  const ordersQuery = useQuery<ClientOrdersQueryResponse>(
    CLIENT_ORDERS_FOR_VISIT_QUERY,
    {
      variables: {
        input: {
          first: RECENT_ORDERS,
          order: { by: "order_date", dir: "desc" },
          filters: [
            { field: "client_id", operator: "eq", value: clientId ?? "" },
          ],
        },
      },
      skip: !open || !clientId || isOrderFixed,
    }
  );
  const orderOptions = useMemo<SelectOption[]>(
    () =>
      (ordersQuery.data?.schedule_orders?.edges ?? []).map(({ node }) => ({
        value: node.id,
        label: orderLabel(node),
      })),
    [ordersQuery.data]
  );

  return {
    clientOptions: sellerId ? walletOptions : company.options,
    clientsLoading: sellerId ? wallet.loading : company.loading,
    /** Busca no servidor só na lista da empresa (a carteira vem inteira). */
    onSearchClients: sellerId ? undefined : company.onSearch,
    orderOptions,
    clientsError: wallet.error,
  };
}
