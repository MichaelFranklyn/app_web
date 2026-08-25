"use client";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

import { INSIGHT_CASES_QUERY } from "../../gql";
import { Insight, InsightCasesResponse } from "../../interface";
import { caseTotal, INSIGHT_COPY } from "../../utils";
import { CaseRow } from "./CaseRow";

/** Uma página do modal. Vinte cabem na tela sem virar rolagem infinita. */
const PAGE_SIZE = 20;

interface Props {
  insight: Insight;
  /** Do vendedor escolhido no topo da tela — o mesmo recorte do cartão. */
  sellerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Todos os casos de uma pendência — o que havia por trás do "e mais 174".
 *
 * O cartão mostra três exemplos porque três bastam para reconhecer o assunto.
 * Mas "23 clientes passaram do ritmo de compra" só vira trabalho quando se sabe
 * QUAIS são os 23: sem a lista, o número era uma opinião do sistema que ninguém
 * podia conferir nem usar.
 *
 * A lista vem do servidor, uma página por vez, e é a MESMA consulta que produziu
 * as três amostras — mesma ordem, mesma régua. Só é pedida quando alguém abre o
 * modal: a tela tem nove cartões, e baixar as centenas de casos de todos eles
 * para mostrar três de cada pagaria a lista inteira sem ninguém tê-la pedido.
 */
export function InsightCasesModal({
  insight,
  sellerId,
  open,
  onOpenChange,
}: Props) {
  const [page, setPage] = useState(1);
  const copy = INSIGHT_COPY[insight.kind];

  const { data, loading, error, refetch } = useQuery<InsightCasesResponse>(
    INSIGHT_CASES_QUERY,
    {
      variables: {
        kind: insight.kind,
        sellerId,
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      },
      // Sem o modal aberto não há pergunta a fazer.
      skip: !open,
      fetchPolicy: "cache-and-network",
    }
  );

  const result = data?.myInsightCases?.data;
  // Enquanto a primeira página não volta, o total conhecido é o do cartão — é o
  // que evita o cabeçalho piscar de "0 casos" para "23 casos".
  const total = result?.totalCount ?? caseTotal(insight);
  const cases = result?.cases ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleOpenChange = (next: boolean) => {
    if (!next) setPage(1);
    onOpenChange(next);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="2xl">
        <Modal.Header
          title={copy.title(insight)}
          description={`${total} ${total === 1 ? "caso" : "casos"} no recorte desta tela.`}
        />

        <Modal.Body className="flex flex-col gap-12">
          {error && !result ? (
            <QueryError onRetry={() => refetch()} />
          ) : loading && !result ? (
            <div className="flex justify-center py-32">
              <Loading.Spinner />
            </div>
          ) : cases.length === 0 ? (
            <Title
              variant="body-sm"
              color="muted"
              className="py-24 text-center"
            >
              Nada por aqui — a pendência foi resolvida enquanto esta tela
              estava aberta.
            </Title>
          ) : (
            <ul className="flex flex-col gap-2">
              {/* Mesma razão do cartão: `item.id` é o registro apontado, e
                  o mesmo registro pode ocupar duas linhas. Compor com o rótulo
                  não bastava — dois vínculos do mesmo cliente têm id E rótulo
                  iguais, e diferem só na fábrica do detalhe. */}
              {cases.map((item, index) => (
                <CaseRow key={`${item.id}-${index}`} item={item} />
              ))}
            </ul>
          )}
        </Modal.Body>

        <Modal.Footer className="flex flex-wrap items-center justify-between gap-12">
          <Pagination.Smart
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          <Modal.Close asChild>
            <Button.Root
              appearance="ghost"
              color="neutral"
              size="sm"
              noUppercase
            >
              <Button.Title>Fechar</Button.Title>
            </Button.Root>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
