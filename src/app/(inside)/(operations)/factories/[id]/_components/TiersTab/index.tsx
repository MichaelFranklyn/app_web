"use client";

import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { FACTORY_TIER_COLUMN_HELP } from "../../../help";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { Layers } from "lucide-react";
import { useMemo } from "react";
import { AddTierModal } from "./AddTierModal";
import { EditTierModal } from "./EditTierModal";
import { PRICE_TIERS_QUERY, PriceTiersData } from "./gql";
import { RemoveTierModal } from "./RemoveTierModal";

interface Props {
  companyFactoryId: string;
}

type PriceTier = { id: string; name: string };

const getConnection = (d: PriceTiersData) => d.price_tiers;

export function TiersTab({ companyFactoryId }: Props) {
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

  const { data, loading, error, refetch } = useCompleteList<PriceTiersData>(
    PRICE_TIERS_QUERY,
    listInput,
    getConnection,
    { skip: !companyFactoryId }
  );

  const initialTiers = useMemo<PriceTier[]>(
    () => data?.price_tiers?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<PriceTier>({
    initialData: initialTiers,
  });
  const tiers = optimistic.items;
  const handleChanged = () => {
    refetch();
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Níveis comerciais
          <HelpTooltip
            label="O que é um nível comercial?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Nível comercial
                </Title>
                <Title variant="body-sm">
                  Classe de cliente que recebe um preço diferente — por exemplo,
                  varejo × atacado. Dentro de cada tabela, você lança um preço
                  por produto para cada nível.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddTierModal
            companyFactoryId={companyFactoryId}
            onAdded={handleChanged}
            onAddOptimistic={optimistic.addOptimistic}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head title={FACTORY_TIER_COLUMN_HELP.tier}>Nível</Table.Head>
            <Table.Head
              className="text-right"
              title={FACTORY_TIER_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={2} rows={3} />
          ) : error && tiers.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : tiers.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Layers size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum nível comercial</EmptyState.Title>
                  <EmptyState.Description>
                    Níveis (varejo, atacado…) permitem cobrar preços diferentes
                    por tipo de cliente. Crie ao menos um para lançar preços.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            tiers.map((tier) => (
              <Table.Row key={tier.id}>
                <Table.Cell variant="strong">{tier.name}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditTierModal
                      tierId={tier.id}
                      tierName={tier.name}
                      onChanged={handleChanged}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                    <RemoveTierModal
                      tierId={tier.id}
                      tierName={tier.name}
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
