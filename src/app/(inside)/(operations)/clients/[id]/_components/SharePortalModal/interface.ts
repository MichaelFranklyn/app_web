export interface ClientPortalLink {
  /** Só vem preenchida na emissão — depois disso, só o hash existe no banco. */
  url: string | null;
  expiresAt: string;
  lastAccessedAt: string | null;
  createdAt: string;
}

export interface ClientPortalLinkQueryResponse {
  clientPortalLink: { status: boolean; data: ClientPortalLink | null } | null;
}

export interface IssueClientPortalLinkResponse {
  issueClientPortalLink: {
    status: boolean;
    message: string;
    data: ClientPortalLink | null;
  } | null;
}

export interface RevokeClientPortalLinkResponse {
  revokeClientPortalLink: { status: boolean; message: string } | null;
}

export interface PortalContact {
  id: string;
  name: string;
  email: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface PortalContactsResponse {
  clientContacts: {
    edges: { node: PortalContact }[];
    totalCount: number;
  };
}

export interface SendClientPortalLinkEmailResponse {
  sendClientPortalLinkEmail: { status: boolean; message: string } | null;
}
