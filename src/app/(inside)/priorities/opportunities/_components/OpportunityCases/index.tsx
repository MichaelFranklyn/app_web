"use client";

import { RowList } from "@/components/RowList";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { getBrtTodayIso } from "@/utils/format/date";
import { plural } from "@/utils/format/plural";
import { Users } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

import { OPPORTUNITY_CASES_QUERY } from "../../gql";
import {
  Opportunity,
  OpportunityCase,
  OpportunityCasesResponse,
} from "../../interface";
import { caseTotal, OPPORTUNITY_COPY } from "../../utils";
import { CaseRow } from "./CaseRow";

/** Uma página da lista. Vinte cabem na tela sem virar rolagem infinita. */
const PAGE_SIZE = 20;

interface Props {
  opportunity: Opportunity;
  /** Do vendedor escolhido no topo — o mesmo recorte do cartão. */
  sellerId: string | null;
  canPlanVisits: boolean;
  /** Depois de agendar ou planejar: os cartões releem o que está marcado. */
  onChanged: () => void;
}

/**
 * Todos os clientes de uma oportunidade, na PRÓPRIA página — não num modal:
 * daqui se agenda o contato e se planeja a visita, e cada ação abre o seu
 * modal (modal sobre modal é proibido).
 *
 * Em ordem alfabética (o cartão mostra os mais urgentes; aqui a pessoa procura
 * pelo nome), uma página por vez, e só quando alguém abre o cartão.
 */
export function OpportunityCases({
  opportunity,
  sellerId,
  canPlanVisits,
  onChanged,
}: Props) {
  const [page, setPage] = useState(1);
  const [contactFor, setContactFor] = useState<OpportunityCase | null>(null);
  const [visitFor, setVisitFor] = useState<OpportunityCase | null>(null);
  const copy = OPPORTUNITY_COPY[opportunity.kind];

  const { data, loading, error, refetch } = useQuery<OpportunityCasesResponse>(
    OPPORTUNITY_CASES_QUERY,
    {
      variables: {
        kind: opportunity.kind,
        sellerId,
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const result = data?.myInsightCases?.data;
  // Enquanto a primeira página não volta, o total conhecido é o do cartão.
  const total = result?.totalCount ?? caseTotal(opportunity);
  const cases = result?.cases ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // A ação muda o "ligação marcada para X" desta linha e as amostras do
  // cartão: as duas leituras voltam a perguntar.
  const afterAction = () => {
    refetch();
    onChanged();
  };

  return (
    <Card.Root data-tour="opportunities-cases">
      <Card.Header>
        <Card.Header.Title>{copy.title}</Card.Header.Title>
        <Card.Header.Description>
          {plural(total, "cliente", "clientes")} · em ordem alfabética
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        {error && !result ? (
          <QueryError onRetry={() => refetch()} />
        ) : loading && !result ? (
          <div className="flex flex-col gap-8" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <Loading.Skeleton key={i} shape="md" className="h-56 w-full" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <EmptyState.Root flat>
            <EmptyState.Icon>
              <Users />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhum cliente aqui agora</EmptyState.Title>
            <EmptyState.Description>
              A leitura mudou enquanto a tela estava aberta.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <RowList.Root>
            {/* `item.id` é o cliente, e o mesmo cliente pode ocupar duas
                linhas (duas fábricas): a chave leva o índice junto. */}
            {cases.map((item, index) => (
              <RowList.Item key={`${item.id}-${index}`}>
                <CaseRow
                  item={item}
                  canPlanVisits={canPlanVisits}
                  onScheduleContact={setContactFor}
                  onPlanVisit={setVisitFor}
                />
              </RowList.Item>
            ))}
          </RowList.Root>
        )}

        {totalPages > 1 && (
          <Pagination.Smart
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </Card.Body>

      {contactFor?.clientId && (
        <ScheduleVisitModal
          open
          onOpenChange={(open) => !open && setContactFor(null)}
          clientId={contactFor.clientId}
          clientName={contactFor.label}
          contactType="REMOTE"
          // Hoje já sugerido: a oportunidade é para agir agora — quem quiser
          // outro dia troca, mas ninguém precisa abrir o calendário para isso.
          defaultDate={getBrtTodayIso()}
          onScheduled={afterAction}
        />
      )}
      {visitFor?.clientId && (
        <ScheduleVisitModal
          open
          onOpenChange={(open) => !open && setVisitFor(null)}
          clientId={visitFor.clientId}
          clientName={visitFor.label}
          onScheduled={afterAction}
        />
      )}
    </Card.Root>
  );
}
