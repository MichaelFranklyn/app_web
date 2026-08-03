"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { CalendarClock } from "lucide-react";
import { useMemo } from "react";
import { AddPaymentTermModal } from "./AddPaymentTermModal";
import { EditPaymentTermModal } from "./EditPaymentTermModal";
import {
  buildFactoryPaymentTermsVariables,
  FACTORY_PAYMENT_TERMS_QUERY,
  FactoryPaymentTermsData,
  PaymentTermNode,
} from "./gql";
import { RemovePaymentTermModal } from "./RemovePaymentTermModal";
import { formatInstallments, installmentsCountLabel } from "./utils";

interface Props {
  companyFactoryId: string;
}

export function PaymentTermsTab({ companyFactoryId }: Props) {
  const { data, loading, error, refetch } = useQuery<FactoryPaymentTermsData>(
    FACTORY_PAYMENT_TERMS_QUERY,
    { variables: buildFactoryPaymentTermsVariables(companyFactoryId) }
  );

  const initial = useMemo<PaymentTermNode[]>(
    () => data?.payment_terms?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<PaymentTermNode>({
    initialData: initial,
  });
  const terms = optimistic.items;
  const handleChanged = () => {
    refetch();
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Prazos de pagamento
          <HelpTooltip
            label="O que é um prazo de pagamento?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Prazo de pagamento
                </Title>
                <Title variant="body-sm">
                  Combinação de vencimentos das parcelas do pedido — por
                  exemplo, &quot;30/60/90&quot; gera 3 boletos, para 30, 60 e 90
                  dias. Ao criar um pedido você escolhe um destes prazos.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddPaymentTermModal
            companyFactoryId={companyFactoryId}
            onAdded={handleChanged}
            onAddOptimistic={optimistic.addOptimistic}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Vencimentos (dias)</Table.Head>
            <Table.Head>Parcelas</Table.Head>
            <Table.Head>Valor mínimo</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={4} rows={3} />
          ) : error && terms.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : terms.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CalendarClock size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum prazo de pagamento</EmptyState.Title>
                  <EmptyState.Description>
                    Cadastre os prazos que esta fábrica oferece (ex.: 30/60/90).
                    Eles ficam disponíveis para escolha ao criar um pedido.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            terms.map((term) => (
              <Table.Row key={term.id}>
                <Table.Cell>
                  <Badge.Root color="subtle" appearance="tinted">
                    <Badge.Text>
                      {formatInstallments(term.installmentsDays)}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {installmentsCountLabel(term.installmentsDays)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText
                    variant={term.minOrderAmount ? "strong" : "dim"}
                  >
                    {term.minOrderAmount
                      ? formatMoney(term.minOrderAmount)
                      : "Sem mínimo"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditPaymentTermModal
                      term={term}
                      onChanged={handleChanged}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                    <RemovePaymentTermModal
                      termId={term.id}
                      termName={term.name}
                      onRemoved={handleChanged}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
