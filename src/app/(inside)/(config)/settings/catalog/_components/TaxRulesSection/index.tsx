"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Percent } from "lucide-react";
import { useMemo } from "react";
import { TAX_RULES_QUERY } from "../../gql";
import { AddTaxRuleModal } from "./AddTaxRuleModal";
import { DeleteTaxRuleModal } from "./DeleteTaxRuleModal";
import { EditTaxRuleModal } from "./EditTaxRuleModal";

interface TaxRuleNode {
  id: string;
  name: string;
}

const listInput = { first: 200 };

export function TaxRulesSection() {
  const { data, loading, refetch } = useQuery<{
    taxRules: { edges: { node: TaxRuleNode }[]; totalCount: number };
  }>(TAX_RULES_QUERY, { variables: { input: listInput } });

  const initial = useMemo<TaxRuleNode[]>(
    () => data?.taxRules.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<TaxRuleNode>({ initialData: initial });
  const rules = optimistic.items;
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Regras de imposto
          <HelpTooltip
            label="Como funcionam as regras de imposto?"
            content={
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Tipo de cálculo
                  </Title>
                  <Title variant="body-sm">
                    Percentual (%) aplica uma alíquota sobre o preço; Valor fixo
                    (R$) soma um valor fechado por item.
                  </Title>
                </div>
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Incluso no preço
                  </Title>
                  <Title variant="body-sm">
                    &quot;Sim&quot; = o imposto já está embutido no preço
                    cadastrado. &quot;Não&quot; = é somado por cima do preço ao
                    montar o pedido.
                  </Title>
                </div>
                <Title variant="body-sm" color="muted">
                  As regras são o catálogo de impostos da empresa. A alíquota de
                  cada produto é definida depois, na tabela de preços.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddTaxRuleModal
            onAddOptimistic={optimistic.addOptimistic}
            onDone={onChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>
      <Table.Table maxHeight={360}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Nome</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={2} rows={3} />
          ) : rules.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Percent size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma regra de imposto</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Nova regra&quot; para cadastrar os impostos
                    aplicados aos produtos da empresa.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            rules.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell variant="strong">{r.name}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditTaxRuleModal
                      rule={r}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onDone={onChanged}
                    />
                    <DeleteTaxRuleModal
                      ruleId={r.id}
                      ruleName={r.name}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onDone={onChanged}
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
