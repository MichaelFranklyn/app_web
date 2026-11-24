"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { RowList } from "@/components/RowList";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { formatDate } from "@/utils/format/date";
import { plural } from "@/utils/format/plural";
import { ChevronUp, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PendingItem, PendingType } from "../../interface";
import { usePendingCases } from "../../usePendingCases";
import { PENDING_TYPE_LABEL, returnDefaultDate } from "../../utils";
import { CaseRow } from "./CaseRow";

interface Props {
  type: PendingType;
  /** O número do cartão — vale até a primeira página da lista chegar. */
  count: number;
  filterValues: Record<string, string>;
  /** Gestor: filtra por vendedor e vê de quem é cada pendência. */
  canSelectSeller: boolean;
  page: number;
  onPageChange: (page: number) => void;
  /** Depois de agendar um contato: os cartões releem os números. */
  onChanged: () => void;
  /**
   * Fecha a lista daqui mesmo. Ela abre longe do cartão (abaixo de todos), e
   * o único "Fechar lista" ficava lá em cima, fora da vista de quem leu.
   */
  onClose: () => void;
}

/**
 * Todas as pendências de um assunto, na PRÓPRIA página — não num modal: daqui
 * se agenda o contato de um retorno, e essa ação abre o modal dela (modal
 * sobre modal é proibido).
 *
 * Da mais urgente para a que pode esperar (prioridade, depois o prazo mais
 * antigo): é a ordem de trabalho, a mesma que escolheu a amostra do cartão.
 */
export function PendingCases({
  type,
  count,
  filterValues,
  canSelectSeller,
  page,
  onPageChange,
  onChanged,
  onClose,
}: Props) {
  // Um modal só, fora das linhas: evento de dentro do modal (portal) subiria
  // até a linha.
  const [scheduling, setScheduling] = useState<PendingItem | null>(null);
  const cases = usePendingCases({
    type,
    filterValues,
    page,
    canSelectSeller,
    fallbackTotal: count,
  });

  // A lista abre DEPOIS de todos os cartões — com seis assuntos na tela, fora
  // da vista de quem clicou. Ela vem até a pessoa: sem isto o botão virava
  // "Fechar lista" e nada mais parecia ter acontecido. Vale também para quem
  // chega pelo link do aviso (`/priorities?type=…`).
  const anchor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    anchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // O selo de prioridade só separa alguma coisa quando a página mistura
  // degraus; numa lista toda Alta ele é ruído repetido em cada linha.
  const showPriority =
    new Set(cases.items.map((item) => item.priority)).size > 1;

  const afterAction = () => {
    cases.refetch();
    onChanged();
  };

  return (
    <Card.Root data-tour="pending-cases">
      <div ref={anchor} className="scroll-mt-16" />
      <Card.Header>
        <Card.Header.Title>{PENDING_TYPE_LABEL[type]}</Card.Header.Title>
        <Card.Header.Description>
          {cases.loading && cases.items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {plural(cases.total, "pendência", "pendências")} · da mais urgente
          para a que pode esperar
        </Card.Header.Description>
        {/* Ação da caixa = primária (pedido de 17/11/2026), como o
            "Fechar lista" do cartão. */}
        <Card.Header.Actions>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="sm"
            onClick={onClose}
          >
            <Button.Title>Fechar lista</Button.Title>
            <Button.Icon icon={ChevronUp} />
          </Button.Root>
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        {cases.failed ? (
          <QueryError onRetry={() => cases.refetch()} />
        ) : cases.showSpinner ? (
          <div className="flex flex-col gap-8" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <Loading.Skeleton key={i} shape="md" className="h-56 w-full" />
            ))}
          </div>
        ) : cases.items.length === 0 ? (
          <EmptyState.Root flat>
            <EmptyState.Icon>
              <CheckCircle2 />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma pendência aqui agora</EmptyState.Title>
            <EmptyState.Description>
              Foi resolvida enquanto a tela estava aberta, ou o filtro de prazo
              não alcança este assunto.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <RowList.Root spacing="md">
            {cases.items.map((item) => (
              <RowList.Item key={item.id}>
                <CaseRow
                  item={item}
                  showSeller={canSelectSeller}
                  showPriority={showPriority}
                  onScheduleReturn={setScheduling}
                />
              </RowList.Item>
            ))}
          </RowList.Root>
        )}

        {cases.totalPages > 1 && (
          <Pagination.Smart
            currentPage={page}
            totalPages={cases.totalPages}
            onPageChange={onPageChange}
          />
        )}
      </Card.Body>

      {scheduling && (
        <ScheduleVisitModal
          open
          onOpenChange={(open) => !open && setScheduling(null)}
          clientId={scheduling.clientId}
          clientName={scheduling.clientName}
          // O retorno é da carteira de quem o ouviu: a parada vai para ele.
          sellerId={scheduling.sellerId}
          returnItemId={scheduling.entityId}
          returnLabel={formatDate(scheduling.dueDate)}
          defaultDate={returnDefaultDate(scheduling.dueDate)}
          onScheduled={afterAction}
        />
      )}
    </Card.Root>
  );
}
