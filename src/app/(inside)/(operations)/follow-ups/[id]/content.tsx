"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { FOLLOW_UP_QUERY } from "@/graphql/followUps";
import { clientDisplayName } from "@/utils/client";
import { formatDate } from "@/utils/format/date";
import {
  FOLLOW_UP_SITUATION_COLOR,
  FOLLOW_UP_SITUATION_HINT,
  FOLLOW_UP_SITUATION_SINGULAR,
  followUpDueLabel,
  isFollowUpOpen,
} from "@/utils/followUp";
import { useQuery } from "@apollo/client/react";
import { PhoneCall } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { FollowUpActions } from "./_components/FollowUpActions";
import { FollowUpSummary } from "./_components/FollowUpSummary";
import { FollowUpTimeline } from "./_components/FollowUpTimeline";
import { FollowUpQueryResponse } from "./interface";

export default function FollowUpContent() {
  const params = useParams();
  const router = useRouter();
  const followUpId = params.id as string;

  const { data, loading, error, refetch } = useQuery<FollowUpQueryResponse>(
    FOLLOW_UP_QUERY,
    { variables: { id: followUpId }, skip: !followUpId }
  );
  const followUp = data?.clientFollowUp?.data ?? null;

  if (error && !followUp) {
    return (
      <PageContent>
        <QueryError onRetry={() => refetch()} />
      </PageContent>
    );
  }

  if (loading && !followUp) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[120px] w-full" />
        <Loading.Skeleton className="h-[220px] w-full" />
      </PageContent>
    );
  }

  if (!followUp) {
    return (
      <PageContent>
        <EmptyState.Root>
          <EmptyState.Icon>
            <PhoneCall size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Contato não encontrado</EmptyState.Title>
          <EmptyState.Description>
            Ele pode ter sido removido, ou o endereço está desatualizado.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button.Root
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              onClick={() => router.push("/follow-ups")}
            >
              <Button.Title>Voltar para Contatos agendados</Button.Title>
            </Button.Root>
          </EmptyState.Actions>
        </EmptyState.Root>
      </PageContent>
    );
  }

  const open = isFollowUpOpen(followUp.status);
  const when = open
    ? `${formatDate(followUp.dueDate)} · ${followUpDueLabel(followUp.daysLate)}`
    : formatDate(followUp.dueDate);

  return (
    <PageContent>
      <Breadcrumb.Root>
        <Breadcrumb.Item href="/follow-ups">Contatos agendados</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>{followUp.reason}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--green)">
              {clientDisplayName(followUp.client)}
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>{followUp.reason}</PanelHeader.Title>
            <PanelHeader.Description>{when}</PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              <Badge.Root
                color={FOLLOW_UP_SITUATION_COLOR[followUp.situation]}
                appearance="tinted"
                title={FOLLOW_UP_SITUATION_HINT[followUp.situation]}
              >
                <Badge.Text>
                  {FOLLOW_UP_SITUATION_SINGULAR[followUp.situation]}
                </Badge.Text>
              </Badge.Root>
              {/* Encerrado não muda mais: a próxima conversa é um novo
                  agendamento (o backend recusa mexer no que acabou). */}
              {open && (
                <FollowUpActions
                  followUp={followUp}
                  onChanged={() => refetch()}
                />
              )}
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <FollowUpSummary followUp={followUp} />
      <FollowUpTimeline events={followUp.events ?? []} />
    </PageContent>
  );
}
