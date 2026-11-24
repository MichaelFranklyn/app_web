"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { QueryError } from "@/components/QueryError";
import { SupportCaseModal } from "@/components/SupportCaseModal";
import { SUPPORT_CASE_QUERY } from "@/graphql/support";
import {
  SUPPORT_STATUS_COLOR,
  SUPPORT_STATUS_HINT,
  SUPPORT_STATUS_LABEL,
} from "@/utils/support";
import { useQuery } from "@apollo/client/react";
import { Headset, Pencil } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { AddUpdateCard } from "./_components/AddUpdateCard";
import { CaseSkeleton } from "./_components/CaseSkeleton";
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

  // Mesma forma do loading.tsx: a espera da navegação e a da query não trocam
  // de desenho no meio.
  if (loading && !supportCase) return <CaseSkeleton />;

  if (!supportCase) {
    return (
      <PageContent>
        <EmptyState.Root>
          <EmptyState.Icon>
            <Headset size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Reclamação não encontrada</EmptyState.Title>
          <EmptyState.Description>
            Ele pode ter sido removido, ou o endereço está desatualizado.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button.Root
              appearance="solid"
              color="amber"
              size="md"
              onClick={() => router.push("/support")}
            >
              <Button.Title>Voltar para Reclamações</Button.Title>
            </Button.Root>
          </EmptyState.Actions>
        </EmptyState.Root>
      </PageContent>
    );
  }

  return (
    <PageContent>
      {/* Breadcrumb e header colados (gap-8), como nas outras telas de
          detalhe: soltos no PageContent herdavam o gap-20 e o header parecia
          desgarrado do caminho (14/11/2026). */}
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/support">Reclamações</Breadcrumb.Item>
          <Breadcrumb.Separator />
          {/* Uma linha só: o título inteiro já vem logo abaixo, e no celular
              a trilha ocupava duas linhas repetindo-o (crítica de 23/11/2026). */}
          <Breadcrumb.Item active className="min-w-0 truncate">
            {supportCase.title}
          </Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Heading {...PAGE_HEADING.support}>
                {supportCase.title}
              </PanelHeader.Heading>
              {/* O cliente saiu daqui: é a primeira linha do resumo logo abaixo
                  (crítica de 23/11/2026). */}
              <PanelHeader.Description>
                {SUPPORT_STATUS_HINT[supportCase.status]}
              </PanelHeader.Description>
              {/* Tarja e ações na MESMA linha, como no detalhe do pedido: com a
                  tarja numa linha própria entre a dica e os botões, o cabeçalho
                  virava três fileiras soltas (crítica de 23/11/2026). No
                  celular as ações ganham a linha inteira abaixo da tarja. */}
              <div className="max-tablet:mt-16 max-tablet:[&>span]:w-full mt-6 flex flex-wrap items-center gap-8">
                <Badge.Root
                  color={SUPPORT_STATUS_COLOR[supportCase.status]}
                  appearance="tinted"
                >
                  <Badge.Text>
                    {SUPPORT_STATUS_LABEL[supportCase.status]}
                  </Badge.Text>
                </Badge.Root>
                <PanelHeader.Actions className="max-tablet:basis-full w-auto grow">
                  <Button.Root
                    type="button"
                    appearance="outline"
                    color="neutral"
                    size="sm"
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
              </div>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

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
