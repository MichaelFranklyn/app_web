export interface ClientNetwork {
  __typename?: "ClientNetworkType";
  id: string;
  name: string;
  notes: string | null;
  isActive: boolean;
  /** Lojas da carteira ligadas a esta rede. */
  storeCount: number;
  /** Faturamento acumulado das lojas (pedidos já faturados). */
  invoicedAmount: string;
  /** Pedido mais recente de qualquer loja da rede. */
  lastOrderDate: string | null;
}

export interface ClientNetworksData {
  client_networks: {
    __typename?: string;
    edges: { __typename?: string; node: ClientNetwork }[];
    pageInfo?: {
      __typename?: string;
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface CreateClientNetworkResponse {
  createClientNetwork: {
    status: boolean;
    message: string;
    data: ClientNetwork | null;
  };
}

export interface UpdateClientNetworkResponse {
  updateClientNetwork: {
    status: boolean;
    message: string;
    data: ClientNetwork | null;
  };
}

export interface DeleteClientNetworkResponse {
  deleteClientNetwork: { status: boolean; message: string };
}
