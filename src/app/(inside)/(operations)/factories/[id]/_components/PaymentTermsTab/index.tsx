"use client";

import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { FACTORY_PAYMENT_TERM_COLUMN_HELP } from "../../../help";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatMoney } from "@/utils/format/masks";
import { CalendarClock } from "lucide-react";
import { useMemo } from "react";
import { AddPaymentTermModal } from "./AddPaymentTermModal";
import { PaymentTermRowActions } from "./PaymentTermRowActions";
import {
  FACTORY_PAYMENT_TERMS_QUERY,
  FactoryPaymentTermsData,
  PAYMENT_TERM_TIERS_QUERY,
  PaymentTermNode,
  PaymentTermTiersData,
} from "./gql";
import {
  formatInstallments,
  installmentsCountLabel,
  TierOption,
  tierLabel,
} from "./utils";

interface Props {
  companyFactoryId: string;
}

const getConnection = (d: FactoryPaymentTermsData) => d.payment_terms;
const getTiers = (d: PaymentTermTiersData) => d.priceTiers;

export function PaymentTermsTab({ companyFactoryId }: Props) {
  // Sem teto fixo: o `first: 50` que estava aqui cobria a fábrica comum e, no
  // dia em que não cobrisse, esconderia o 51º registro sem nada na tela dizer.
  // O hook confere o `totalCount` e rebusca pelo total quando ele passa.
  const listInput = useMemo(
    () => ({
      filters: [
        {
          field: "company_factory_id",
          operator: "eq",
          value: companyFactoryId,
        },
      ],
    }),
    [companyFactoryId]
  );

  const { data, loading, error, refetch } =
    useCompleteList<FactoryPaymentTermsData>(
      FACTORY_PAYMENT_TERMS_QUERY,
      listInput,
      getConnection,
      { skip: !companyFactoryId, fetchPolicy: "cache-and-network" }
    );

  // Os níveis só aparecem quando a fábrica tem mais de um: com um nível só,
  // "de qual nível é o prazo" não é pergunta — todos os clientes são do mesmo.
  const { data: tiersData } = useCompleteList<PaymentTermTiersData>(
    PAYMENT_TERM_TIERS_QUERY,
    listInput,
    getTiers,
    { skip: !companyFactoryId, fetchPolicy: "cache-and-network" }
  );
  const tiers = useMemo<TierOption[]>(
    () =>
      tiersData?.priceTiers?.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [tiersData]
  );
  const showTiers =
    tiers.length > 1 ||
    (data?.payment_terms?.edges.some((e) => e.node.priceTierId) ?? false);
  const columns = showTiers ? 5 : 4;

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
        <Table.CardHead.Title>
          Prazos de pagamento
          <HelpTooltip
            label="O que é um prazo de pagamento?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" weight="semibold">
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
            tiers={showTiers ? tiers : []}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada linha vira cartão, em vez de a tabela rolar de lado. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head title={FACTORY_PAYMENT_TERM_COLUMN_HELP.days}>
              Vencimentos (dias)
            </Table.Head>
            <Table.Head
              align="right"
              title={FACTORY_PAYMENT_TERM_COLUMN_HELP.installments}
            >
              Parcelas
            </Table.Head>
            <Table.Head
              align="right"
              title={FACTORY_PAYMENT_TERM_COLUMN_HELP.minimum}
            >
              Valor mínimo
            </Table.Head>
            {showTiers && (
              <Table.Head title={FACTORY_PAYMENT_TERM_COLUMN_HELP.tier}>
                Nível dos clientes
              </Table.Head>
            )}
            <Table.Head
              className="text-right"
              title={FACTORY_PAYMENT_TERM_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={columns} rows={3} />
          ) : error && terms.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : terms.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <CalendarClock />
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
                {/* O prazo É a identidade da linha: no cartão vira o título,
                    em vez de uma tarja escondida no rodapé (crítica de
                    23/11/2026). */}
                <Table.Cell card="title">
                  <Table.CellText variant="strong">
                    {formatInstallments(term.installmentsDays)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell align="right" label="Parcelas">
                  <Table.CellText variant="dim">
                    {installmentsCountLabel(term.installmentsDays)}
                  </Table.CellText>
                </Table.Cell>
                {/* "Sem mínimo" repetido em todo cartão só ocupa linha. */}
                <Table.Cell
                  align="right"
                  label="Valor mínimo"
                  cardHidden={!term.minOrderAmount}
                >
                  <Table.CellText
                    variant={term.minOrderAmount ? "strong" : "dim"}
                  >
                    {term.minOrderAmount
                      ? formatMoney(term.minOrderAmount)
                      : "Sem mínimo"}
                  </Table.CellText>
                </Table.Cell>
                {showTiers && (
                  <Table.Cell
                    label="Nível dos clientes"
                    cardHidden={!term.priceTierId}
                  >
                    <Table.CellText
                      variant={term.priceTierId ? "strong" : "dim"}
                    >
                      {tierLabel(term.priceTierId, tiers)}
                    </Table.CellText>
                  </Table.Cell>
                )}
                <Table.Cell card="actions">
                  <PaymentTermRowActions
                    edit={{
                      term,
                      onChanged: handleChanged,
                      onUpdateOptimistic: optimistic.updateOptimistic,
                      onCommit: optimistic.commit,
                      onRollback: optimistic.rollback,
                      tiers: showTiers ? tiers : [],
                    }}
                    remove={{
                      termId: term.id,
                      termName: term.name,
                      onRemoved: handleChanged,
                      onRemoveOptimistic: optimistic.removeOptimistic,
                      onCommit: optimistic.commit,
                      onRollback: optimistic.rollback,
                    }}
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
