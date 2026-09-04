"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { SupportCaseModal } from "@/components/SupportCaseModal";
import { SUPPORT_CASE_QUERY } from "@/graphql/support";
import {
  SUPPORT_STATUS_COLOR,
  SUPPORT_STATUS_HINT,
  SUPPORT_STATUS_LABEL,
} from "@/utils/support";
import { clientDisplayName } from "@/utils/client";
import { useQuery } from "@apollo/client/react";
import { Headset, Pencil } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { AddUpdateCard } from "./_components/AddUpdateCard";
import { CaseSummary } from "./_components/CaseSummary";
import { CaseTimeline } from "./_components/CaseTimeline";
import { DeleteCaseModal } from "./_components/DeleteCaseModal";
import { SupportCaseQueryResponse } from "./interface";

export default function SupportCaseContent() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const [editing, setEditing] = useState(false);

  const { data, loading, error, refetch } = useQuery<SupportCaseQueryResponse>(
    SUPPORT_CASE_QUERY,
    { variables: { id: caseId }, skip: !caseId }
  );

  const supportCase = data?.clientSupportCase?.data ?? null;

  // Falha de rede/schema é diferente de "não existe": aqui cabe tentar de novo.
  if (error && !supportCase) {
    return (
      <PageContent>
        <QueryError onRetry={() => refetch()} />
      </PageContent>
    );
  }

  if (loading && !supportCase) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[120px] w-full" />
        <Loading.Skeleton className="h-[220px] w-full" />
      </PageContent>
    );
  }

  if (!supportCase) {
    return (
      <PageContent>
        <EmptyState.Root>
          <EmptyState.Icon>
            <Headset size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Atendimento não encontrado</EmptyState.Title>
          <EmptyState.Description>
            Ele pode ter sido removido, ou o endereço está desatualizado.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button.Root
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              onClick={() => router.push("/support")}
            >
              <Button.Title>Voltar para Atendimentos</Button.Title>
            </Button.Root>
          </EmptyState.Actions>
        </EmptyState.Root>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <Breadcrumb.Root>
        <Breadcrumb.Item href="/support">Atendimentos</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>{supportCase.title}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--green)">
              {clientDisplayName(supportCase.client)}
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>{supportCase.title}</PanelHeader.Title>
            <PanelHeader.Description>
              {SUPPORT_STATUS_HINT[supportCase.status]}
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              <Badge.Root
                color={SUPPORT_STATUS_COLOR[supportCase.status]}
                appearance="tinted"
              >
                <Badge.Text>
                  {SUPPORT_STATUS_LABEL[supportCase.status]}
                </Badge.Text>
              </Badge.Root>
              <Button.Root
                type="button"
                appearance="outline"
                color="neutral"
                size="sm"
                noUppercase
                onClick={() => setEditing(true)}
              >
                <Button.Icon icon={Pencil} />
                <Button.Title>Corrigir dados</Button.Title>
              </Button.Root>
              <DeleteCaseModal
                caseId={supportCase.id}
                caseTitle={supportCase.title}
              />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <CaseSummary supportCase={supportCase} />

      {/* O formulário vem ANTES da história: quem abre o caso já sabe o que
          aconteceu e vem registrar — reler vem depois, se precisar. */}
      <AddUpdateCard
        caseId={supportCase.id}
        currentStatus={supportCase.status}
        onSaved={() => refetch()}
      />

      <CaseTimeline updates={supportCase.updates ?? []} />

      <SupportCaseModal
        open={editing}
        onOpenChange={setEditing}
        supportCase={supportCase}
        onSaved={() => refetch()}
      />
    </PageContent>
  );
}
