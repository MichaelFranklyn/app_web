import { SupportCase } from "@/utils/support";

export interface ClientOptionNode {
  id: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface ClientOptionsData {
  support_clients: {
    edges: { node: ClientOptionNode }[];
    totalCount: number;
  };
}

export interface ClientFactoryNode {
  id: string;
  factoryId: string;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
}

export interface ClientFactoriesData {
  support_client_factories: {
    edges: { node: ClientFactoryNode }[];
    totalCount: number;
  };
}

export interface ClientOrderNode {
  id: string;
  orderDate: string;
  invoiceNumber: string | null;
  status: string;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
}

export interface ClientOrdersData {
  support_client_orders: {
    edges: { node: ClientOrderNode }[];
    totalCount: number;
  };
}

export interface CreateSupportCaseResponse {
  createClientSupportCase?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

export interface UpdateSupportCaseResponse {
  updateClientSupportCase?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

export interface SupportCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Caso existente = modo edição da ficha. A SITUAÇÃO não se muda aqui: ela
   * exige o andamento que a explica (ver a linha do tempo do caso).
   */
  supportCase?: SupportCase | null;
  /** Cliente já definido (aba do cliente). Ausente = o modal pergunta qual. */
  clientId?: string;
  clientName?: string;
  /** Depois de salvar, para a tela recarregar o que mostra. */
  onSaved?: () => void;
}
