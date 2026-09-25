import { CoverageCadence } from "../orderCoverage";

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
  /** Negativado nesta fábrica: ela não aceita pedido novo deste cliente. */
  isNegative: boolean;
  negativeReason: string | null;
}

export interface FactoryAssignmentsData {
  sellerClientFactoryList: {
    edges: { node: FactoryAssignment }[];
    /** Quantos vínculos a fábrica tem ao todo — é ele que denuncia truncamento. */
    totalCount: number;
  };
}
