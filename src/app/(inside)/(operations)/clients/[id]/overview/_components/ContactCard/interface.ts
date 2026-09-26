export interface ClientContact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface ClientContactsQueryResponse {
  clientContacts: {
    edges: { node: ClientContact }[];
    totalCount: number;
  };
}

export interface UpdateClientContactInput {
  name?: string;
  role?: string | null;
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateClientContactResponse {
  updateClientContact: {
    status: boolean;
    message: string;
    data: ClientContact | null;
  };
}

export interface DeleteClientContactResponse {
  deleteClientContact: {
    status: boolean;
    message: string;
  };
}

export interface ContactCardProps {
  clientId: string;
}
