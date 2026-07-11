"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { getCookie } from "@/utils/cookies/clientCookie";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { FirstAccessResult } from "./_components/FirstAccessResult";
import { ProvisionCompanyForm } from "./_components/ProvisionCompanyForm";
import { useProvisionCompany } from "./useProvisionCompany";

// Provisionar empresas é operação de plataforma: só o super usuário (SU) pode.
// O backend também barra (is_super_user); aqui é o gate de UX.
export default function CompaniesContent() {
  const [role, setRole] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const { submit, reset, result, isLoading } = useProvisionCompany();

  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setRole(userData?.role ?? null);
    setIsResolved(true);
  }, []);

  if (!isResolved) return null;

  if (role !== "SU") {
    return (
      <PageContent>
        <EmptyState.Root>
          <EmptyState.Icon>
            <ShieldAlert size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Acesso restrito</EmptyState.Title>
          <EmptyState.Description>
            Esta área é exclusiva da administração da plataforma.
          </EmptyState.Description>
        </EmptyState.Root>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>Plataforma</PanelHeader.Eyebrow>
            <PanelHeader.Title>Nova empresa</PanelHeader.Title>
            <PanelHeader.Description>
              Cadastre uma empresa e o seu primeiro responsável para liberar o
              primeiro acesso.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {result ? (
        <FirstAccessResult data={result} onProvisionAnother={reset} />
      ) : (
        <ProvisionCompanyForm onSubmit={submit} isLoading={isLoading} />
      )}
    </PageContent>
  );
}
