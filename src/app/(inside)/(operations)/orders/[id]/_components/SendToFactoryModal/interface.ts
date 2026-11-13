export interface FactoryContactNode {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface FactoryContactsResponse {
  factoryContacts: { edges: { node: FactoryContactNode }[] };
}

interface SentResult {
  status: boolean;
  message: string;
  data: { id: string } | null;
}

export interface MarkSentResponse {
  markOrderSent: SentResult;
}

export interface SendEmailResponse {
  sendOrderToFactoryEmail: SentResult;
}

export type SendChannel = "WHATSAPP" | "EMAIL";
