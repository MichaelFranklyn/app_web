import { ClientNetwork } from "../interface";

export interface ClientNetworkDetailData {
  clientNetwork: {
    status: boolean;
    message: string;
    data: ClientNetwork | null;
  };
}

/** Loja da rede — o recorte da carteira que a tela de detalhe mostra. */
export interface NetworkStore {
  __typename?: "ClientType";
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressCity: string | null;
  addressState: string | null;
  companyClient: {
    id: string;
    lastOrderDate: string | null;
    segment: { id: string; name: string } | null;
    sellers: { id: string; name: string }[];
  } | null;
}

export interface NetworkStoresData {
  network_stores: {
    __typename?: string;
    edges: { __typename?: string; node: NetworkStore }[];
    pageInfo?: {
      __typename?: string;
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}
