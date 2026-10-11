"use client";

import { Card } from "@/components/Card";
import { FollowUpModal } from "@/components/FollowUpModal";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { Title } from "@/components/Title";
import { getBrtTodayIso } from "@/utils/format/date";
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

  // A ação muda o "contato agendado para X" desta linha e as amostras do
  // cartão: as duas leituras voltam a perguntar.
  const afterAction = () => {
    refetch();
    onChanged();
  };

  return (
    <Card.Root data-tour="opportunities-cases">
      <Card.Body className="flex flex-col gap-12">
        <div className="flex flex-wrap items-baseline justify-between gap-8">
          <Title variant="heading-sm">{copy.title}</Title>
          <Title variant="micro" color="muted">
            {total} {total === 1 ? "cliente" : "clientes"} · em ordem alfabética
          </Title>
        </div>

        {error && !result ? (
          <QueryError onRetry={() => refetch()} />
        ) : loading && !result ? (
          <div className="flex justify-center py-32">
            <Loading.Spinner />
          </div>
        ) : cases.length === 0 ? (
          <Title variant="body-sm" color="muted" className="py-24 text-center">
            Nenhum cliente aqui agora — a leitura mudou enquanto a tela estava
            aberta.
          </Title>
        ) : (
          <ul className="flex flex-col gap-2">
            {/* `item.id` é o cliente, e o mesmo cliente pode ocupar duas
                linhas (duas fábricas): a chave leva o índice junto. */}
            {cases.map((item, index) => (
              <CaseRow
                key={`${item.id}-${index}`}
                item={item}
                canPlanVisits={canPlanVisits}
                onScheduleContact={setContactFor}
                onPlanVisit={setVisitFor}
              />
            ))}
          </ul>
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
        <FollowUpModal
          open
          onOpenChange={(open) => !open && setContactFor(null)}
          clientId={contactFor.clientId}
          clientName={contactFor.label}
          // Hoje já sugerido: a oportunidade é para agir agora — quem quiser
          // outro dia troca, mas ninguém precisa abrir o calendário para isso.
          defaultDueDate={getBrtTodayIso()}
          onSaved={afterAction}
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
