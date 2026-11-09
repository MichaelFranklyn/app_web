import { gql } from "@apollo/client";
import type { UserRole } from "@/app/(auth)/login/interface";

// Multi-escritório: a mesma pessoa (um email, uma senha) pode trabalhar em
// mais de um escritório, como uma conta Google em vários projetos do Cloud.
// Cada escritório é uma sessão à parte — trocar de escritório troca o token.
//
// Os documentos moram aqui, e não num `gql.ts` de página, porque quem os usa
// são a rota /api/session (servidor), a tela de escolha e o seletor da topbar.

const LOGIN_PAYLOAD_FIELDS = `
  status
  code
  message
  data {
    accessToken
    refreshToken
    userId
    userName
    companyName
    role
    sellerId
    companyId
    isCompanyChoicePending
  }
`;

export const SWITCH_COMPANY_MUTATION = gql`
  mutation SwitchCompany($companyId: UUID!) {
    switchCompany(companyId: $companyId) {
      ${LOGIN_PAYLOAD_FIELDS}
    }
  }
`;

export const ACCEPT_INVITATION_MUTATION = gql`
  mutation AcceptInvitation($companyId: UUID!) {
    acceptInvitation(companyId: $companyId) {
      ${LOGIN_PAYLOAD_FIELDS}
    }
  }
`;

export const DECLINE_INVITATION_MUTATION = gql`
  mutation DeclineInvitation($companyId: UUID!) {
    declineInvitation(companyId: $companyId) {
      status
      message
    }
  }
`;

export const MY_COMPANIES_QUERY = gql`
  query MyCompanies {
    myCompanies {
      status
      message
      data {
        companyId
        companyName
        role
        isInvitationPending
        isCurrent
      }
    }
  }
`;

export interface MyOffice {
  companyId: string;
  companyName: string;
  /** Papel da pessoa NESTE escritório. */
  role: UserRole;
  /** Convite ainda não respondido: aceitar ou recusar antes de entrar. */
  isInvitationPending: boolean;
  /** Escritório da sessão atual. */
  isCurrent: boolean;
}

export interface MyCompaniesData {
  myCompanies: { status: boolean; message: string; data: MyOffice[] };
}

/** Tela de escolha do escritório (depois do login, para quem tem 2+). */
export const CHOOSE_OFFICE_ROUTE = "/choose-office";

/** Ações da rota /api/session que trocam o escritório da sessão. */
export const OFFICE_SESSION_ACTIONS = {
  switchCompany: { doc: SWITCH_COMPANY_MUTATION, field: "switchCompany" },
  acceptInvitation: {
    doc: ACCEPT_INVITATION_MUTATION,
    field: "acceptInvitation",
  },
} as const;

export type OfficeSessionAction = keyof typeof OFFICE_SESSION_ACTIONS;

/** Rótulo do papel para a pessoa ler — o mesmo vocabulário do resto do
 *  sistema (`ROLE_LABEL` da casca), nunca o "OWNER" cru. */
export const OFFICE_ROLE_LABEL: Record<UserRole, string> = {
  SU: "Super Admin",
  SUPPORT: "Suporte",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};
