"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { getCookie } from "@/utils/cookies/clientCookie";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { FirstAccessResult } from "./_components/FirstAccessResult";
import { ProvisionCompanyForm } from "./_components/ProvisionCompanyForm";
import { useProvisionCompany } from "./useProvisionCompany";

// Campos do FORM_STEPS (CNPJ, segmento, nome/e-mail/senha do responsável) — o
// placeholder do formulário nasce com a mesma altura que o card vai ter.
const FORM_FIELD_ROWS = 5;

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

  // O papel só é conhecido depois do mount (cookie é client-only). Devolver
  // `null` aqui deixava a área de conteúdo vazia nesse intervalo; o placeholder
  // tem a forma do card do formulário, que é o que vai aparecer.
  if (!isResolved) {
    return (
      <PageContent>
        <Card.Root className="max-w-[720px]">
          <Card.Body className="flex flex-col gap-20">
            {Array.from({ length: FORM_FIELD_ROWS }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[6px]">
                <Loading.Skeleton className="h-[10px] w-24" />
                <Loading.Skeleton className="h-[40px] w-full" />
              </div>
            ))}
            <div className="flex justify-end">
              <Loading.Skeleton className="h-[36px] w-[180px]" />
            </div>
          </Card.Body>
        </Card.Root>
      </PageContent>
    );
  }

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
