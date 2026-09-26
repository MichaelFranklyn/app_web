export interface NewClientContact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface CreateClientContactInput {
  clientId: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

export interface CreateClientContactResponse {
  createClientContact: {
    status: boolean;
    message: string;
    data: NewClientContact | null;
  };
}
