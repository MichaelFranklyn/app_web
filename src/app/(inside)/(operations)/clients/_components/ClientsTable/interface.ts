export interface Client {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnae: string;
  cnaeDescription: string | null;
  addressCity: string | null;
  addressState: string | null;
}

export interface ClientsQueryResponse {
  clients_list: {
    edges: { node: Client }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface QueryData {
  clients_list: ClientsQueryResponse["clients_list"];
}
