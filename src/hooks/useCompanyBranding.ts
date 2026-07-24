"use client";

import { useUserData } from "@/hooks/useUserData";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

/**
 * Marca da empresa logada (nome + logo) para o cabeçalho do sistema e para o
 * PDF que vai ao cliente. Query enxuta e cacheada pelo Apollo — a sidebar
 * renderiza em toda página e não deve custar mais que isso.
 */
export const COMPANY_BRANDING_QUERY = gql`
  query CompanyBranding {
    company_branding: myCompany {
      status
      data {
        id
        razaoSocial
        nomeFantasia
        logoUrl
        avatarUrl
      }
    }
  }
`;

export interface CompanyBranding {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  /** Marca completa (com o nome) — documentos. */
  logoUrl: string | null;
  /** Símbolo quadrado — avatar do sistema. */
  avatarUrl: string | null;
}

interface CompanyBrandingData {
  company_branding: { status: boolean; data: CompanyBranding | null };
}

export function useCompanyBranding() {
  // Super usuário não tem empresa no contexto — a query voltaria erro.
  const { userData } = useUserData();
  const isSuperUser = userData?.role === "SU";

  const { data, loading } = useQuery<CompanyBrandingData>(
    COMPANY_BRANDING_QUERY,
    { skip: !userData || isSuperUser, fetchPolicy: "cache-first" }
  );

  const company = data?.company_branding?.data ?? null;

  return {
    company,
    loading,
    name: company?.nomeFantasia ?? company?.razaoSocial ?? null,
    /** Para documentos (PDF): a marca completa. */
    logoUrl: company?.logoUrl ?? null,
    /** Para o avatar: o símbolo, caindo para a logo completa quando não há. */
    avatarUrl: company?.avatarUrl ?? company?.logoUrl ?? null,
  };
}
