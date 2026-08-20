import { CoverageCadence } from "../../../../_shared/orderCoverage";

// Tipos compartilhados entre AddOrderModal e ImportOrderModal (vivem no pai).
export interface CreateOrderResponse {
  createOrder: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      orderDate: string;
      totalAmount: string;
      commissionAmount: string;
      status: string;
      seller: { id: string; name: string } | null;
      client: {
        id: string;
        razaoSocial: string;
        nomeFantasia: string | null;
      } | null;
    } | null;
  };
}

export interface FactoryAssignment {
  id: string;
  sellerId: string;
  clientId: string;
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string | null;
  } | null;
  /** Ritmo de compra do vínculo — sugere a cobertura no fechamento do pedido. */
  cadence: CoverageCadence | null;
}

export interface FactoryAssignmentsData {
  sellerClientFactoryList: {
    edges: { node: FactoryAssignment }[];
    /** Quantos vínculos a fábrica tem ao todo — é ele que denuncia truncamento. */
    totalCount: number;
  };
}
