/** Uma linha da tabela de contatos da fábrica. */
export interface FactoryContact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  /** Destacado como o contato a usar primeiro (é quem o envio do pedido pega). */
  isPrimary: boolean;
  isActive: boolean;
}

export interface FactoryContactsQueryResponse {
  factoryContacts: {
    edges: { node: FactoryContact }[];
    totalCount: number;
  };
}

export interface CreateFactoryContactInput {
  factoryId: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

export interface CreateFactoryContactResponse {
  createFactoryContact: {
    status: boolean;
    message: string;
    data: FactoryContact | null;
  };
}

export interface UpdateFactoryContactInput {
  name?: string;
  role?: string | null;
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateFactoryContactResponse {
  updateFactoryContact: {
    status: boolean;
    message: string;
    data: FactoryContact | null;
  };
}

export interface DeleteFactoryContactResponse {
  deleteFactoryContact: {
    status: boolean;
    message: string;
  };
}
