"use client";

import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";

import { CatalogSectionHead } from "../CatalogSectionHead";
import { TAX_RULE_COLUMN_HELP } from "../../help";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { Percent } from "lucide-react";
import { useMemo } from "react";
import { TAX_RULES_QUERY } from "../../gql";
import { AddTaxRuleModal } from "./AddTaxRuleModal";
import { CatalogRowActions } from "../CatalogRowActions";
import { DeleteTaxRuleModal } from "./DeleteTaxRuleModal";
import { EditTaxRuleModal } from "./EditTaxRuleModal";
import { formatProductCount } from "./utils";

interface TaxRuleNode {
  id: string;
  name: string;
  productCount: number;
}

type Connection = { edges: { node: TaxRuleNode }[]; totalCount: number };

// Sem `first`: quem consome é o `useCompleteList`, que traz o catálogo inteiro
// e rebusca pelo total quando a primeira página não dá conta. O `first: 200`
// que estava aqui cobria a empresa comum e, no dia em que não cobrisse,
// esconderia o cadastro sem nada na tela dizer — e um cadastro que "não existe"
// é procurado, recriado e vira duplicata.
const listInput = { order: { by: "name", dir: "asc" } };
const getConnection = (d: { taxRules: Connection }) => d.taxRules;

export function TaxRulesSection() {
  const { data, loading, error, refetch } = useCompleteList<{
    taxRules: Connection;
  }>(TAX_RULES_QUERY, listInput, getConnection, {
    fetchPolicy: "cache-and-network",
  });

  const initial = useMemo<TaxRuleNode[]>(
    () => data?.taxRules.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<TaxRuleNode>({ initialData: initial });
  const rules = optimistic.items;
  const onChanged = () => refetch();

  return (
    // Largura total, como as demais tabelas do sistema (25/11/2026). O teto de
    // 720px da crítica de 23/11 deixava a tabela "pela metade" no desktop.
    <Table.Root className="w-full">
      <CatalogSectionHead
        title="Regras cadastradas"
        helpLabel="Como funcionam as regras de imposto?"
        helpContent={
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Title variant="label" weight="semibold">
                A regra é só o nome do imposto
              </Title>
              <Title variant="body-sm">
                ST, ICMS, IPI: o nome que aparece no pedido e no PDF. A alíquota
                não fica aqui.
              </Title>
            </div>
            <div className="flex flex-col gap-2">
              <Title variant="label" weight="semibold">
                A alíquota é de cada produto
              </Title>
              <Title variant="body-sm">
                É definida na tabela de preços (ao importar ou editar) ou na
                ficha do produto, em percentual ou pelo cálculo da ST com MVA. O
                imposto é sempre somado por cima do preço.
              </Title>
            </div>
            <div className="flex flex-col gap-2">
              <Title variant="label" weight="semibold">
                IPI é especial
              </Title>
              <Title variant="body-sm">
                O IPI entra na base de cálculo da ST. Por isso a regra
                &quot;IPI&quot; não pode ser renomeada.
              </Title>
            </div>
            <Title variant="body-sm" color="muted">
              Excluir uma regra tira a alíquota dela de todos os produtos e
              recalcula os preços. Pedidos já feitos não mudam.
            </Title>
          </div>
        }
      >
        <AddTaxRuleModal
          onAddOptimistic={optimistic.addOptimistic}
          onDone={onChanged}
        />
      </CatalogSectionHead>
      {/* Abaixo do desktop cada linha vira cartão, com editar/excluir no "⋯". */}
      <Table.Table maxHeight={600} cards>
        <Table.Header>
          <Table.Row>
            <Table.Head title={TAX_RULE_COLUMN_HELP.name}>Nome</Table.Head>
            <Table.Head title={TAX_RULE_COLUMN_HELP.productCount}>
              Produtos
            </Table.Head>
            <Table.Head
              className="text-right"
              title={TAX_RULE_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && rules.length === 0 ? (
            <Table.Skeleton columns={3} rows={3} />
          ) : error && rules.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : rules.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Percent />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma regra cadastrada</EmptyState.Title>
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
                <Table.Cell card="title" variant="strong">
                  {r.name}
                </Table.Cell>
                <Table.Cell label="Produtos">
                  {formatProductCount(r.productCount)}
                </Table.Cell>
                <Table.Cell card="actions">
                  <CatalogRowActions
                    label={`Ações da regra ${r.name}`}
                    editLabel="Editar regra de imposto"
                    deleteLabel="Remover regra de imposto"
                    renderEdit={(control) => (
                      <EditTaxRuleModal
                        {...control}
                        rule={r}
                        onUpdateOptimistic={optimistic.updateOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                        onDone={onChanged}
                      />
                    )}
                    renderDelete={(control) => (
                      <DeleteTaxRuleModal
                        {...control}
                        ruleId={r.id}
                        ruleName={r.name}
                        productCount={r.productCount}
                        onRemoveOptimistic={optimistic.removeOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                        onDone={onChanged}
                      />
                    )}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
