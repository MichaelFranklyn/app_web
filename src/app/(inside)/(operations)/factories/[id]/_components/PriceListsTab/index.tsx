"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FeatureGate } from "@/components/FeatureGate";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { FACTORY_PRICE_LIST_COLUMN_HELP } from "../../../help";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatDateDMY } from "@/utils/format/masks";
import { ListChecks } from "lucide-react";
import { useMemo } from "react";
import { AddPriceListModal } from "./AddPriceListModal";
import { ClonePriceListModal } from "./ClonePriceListModal";
import { ImportPriceListModal } from "./ImportPriceListModal";
import { DeletePriceListModal } from "./DeletePriceListModal";
import { EditPriceListModal } from "./EditPriceListModal";
import {
  FACTORY_PRICE_LISTS_QUERY,
  FactoryPriceListNode,
  FactoryPriceListsData,
} from "./gql";

interface Props {
  companyFactoryId: string;
  factoryId: string;
}

const getConnection = (d: FactoryPriceListsData) => d.factory_price_lists;

export function PriceListsTab({ companyFactoryId, factoryId }: Props) {
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
    useCompleteList<FactoryPriceListsData>(
      FACTORY_PRICE_LISTS_QUERY,
      listInput,
      getConnection,
      { skip: !companyFactoryId, fetchPolicy: "cache-and-network" }
    );

  const initialPriceLists = useMemo<FactoryPriceListNode[]>(
    () => data?.factory_price_lists?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<FactoryPriceListNode>({
    initialData: initialPriceLists,
  });
  const priceLists = optimistic.items;
  const nameById = new Map(priceLists.map((pl) => [pl.id, pl.name]));

  return (
    <Table.Root data-tour="prices-table">
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Tabelas de preços
          <HelpTooltip
            label="O que é uma tabela de preço?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Tabela de preço
                </Title>
                <Title variant="body-sm">
                  Versiona os preços por vigência — promoções, reajustes,
                  histórico. Dentro de cada tabela você lança o preço por
                  produto e nível comercial.
                </Title>
                <Title variant="body-sm" color="muted">
                  Clique numa linha para abrir a tabela e gerenciar os preços.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions data-tour="prices-actions">
          {/* Importação em massa é recurso de plano. */}
          <FeatureGate feature="BULK_IMPORT">
            <ImportPriceListModal
              companyFactoryId={companyFactoryId}
              factoryId={factoryId}
              onImported={() => refetch()}
            />
          </FeatureGate>
          <ClonePriceListModal
            companyFactoryId={companyFactoryId}
            onCloned={() => refetch()}
            onAddOptimistic={optimistic.addOptimistic}
          />
          <AddPriceListModal
            companyFactoryId={companyFactoryId}
            onAdded={() => refetch()}
            onAddOptimistic={optimistic.addOptimistic}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head title={FACTORY_PRICE_LIST_COLUMN_HELP.name}>
              Nome
            </Table.Head>
            <Table.Head title={FACTORY_PRICE_LIST_COLUMN_HELP.region}>
              Região
            </Table.Head>
            <Table.Head title={FACTORY_PRICE_LIST_COLUMN_HELP.from}>
              Vigência início
            </Table.Head>
            <Table.Head title={FACTORY_PRICE_LIST_COLUMN_HELP.to}>
              Vigência fim
            </Table.Head>
            <Table.Head title={FACTORY_PRICE_LIST_COLUMN_HELP.status}>
              Status
            </Table.Head>
            <Table.Head
              className="text-right"
              title={FACTORY_PRICE_LIST_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : error && priceLists.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : priceLists.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <ListChecks size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma tabela de preços</EmptyState.Title>
                  <EmptyState.Description>
                    Crie uma tabela em Tabelas de Preços para começar.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            priceLists.map((pl) => (
              <Table.Row
                key={pl.id}
                href={`/factories/${companyFactoryId}/price-lists/${pl.id}`}
                data-tour="prices-row"
              >
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">{pl.name}</Table.CellText>
                    {pl.clonedFromId && (
                      <Table.CellText variant="dim2">
                        Cópia de{" "}
                        {nameById.get(pl.clonedFromId) ?? "tabela removida"}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell variant="dim">{pl.region || "Geral"}</Table.Cell>
                <Table.Cell variant="dim">
                  {formatDateDMY(pl.validFrom)}
                </Table.Cell>
                <Table.Cell variant="dim">
                  {pl.validUntil ? formatDateDMY(pl.validUntil) : "—"}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={pl.isActive ? "green" : "neutral"}
                    appearance="tinted"
                  >
                    <Badge.Text>{pl.isActive ? "Ativa" : "Inativa"}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditPriceListModal
                      priceList={pl}
                      onChanged={() => refetch()}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                    <DeletePriceListModal
                      priceListId={pl.id}
                      priceListName={pl.name}
                      onRemoved={() => refetch()}
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
