"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  AccessRowActions,
  sellerAgreementLabel,
} from "@/components/SellerFactoryAccess";
import { Table } from "@/components/Table";
import {
  FACTORY_SELLERS_HELP,
  FACTORY_SELLER_COLUMN_HELP,
} from "../../../help";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { personInitials } from "@/utils/format/initials";
import { formatDateDMY } from "@/utils/format/masks";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { AddSellerAccessModal } from "./AddSellerAccessModal";
import { FACTORY_SELLER_ACCESSES_QUERY, SellerAccess } from "./gql";

interface SellersQueryData {
  factory_seller_accesses: {
    edges: { node: SellerAccess }[];
    totalCount: number;
  };
}

interface Props {
  factoryId: string;
  /**
   * Nome da fábrica como a empresa a chama. Os modais do vínculo perguntam
   * "revogar o acesso de Fulano à fábrica X?" — sem o nome, a confirmação fala
   * de um vínculo que a pessoa não consegue identificar.
   */
  factoryName: string;
  /** Abre o modal de vínculo automaticamente (fluxo pós-criação da fábrica). */
  autoOpenLink?: boolean;
}

const getAccesses = (d: SellersQueryData) => d.factory_seller_accesses;

export function SellersTab({ factoryId, factoryName, autoOpenLink }: Props) {
  // Sem teto fixo: o `first: 50` cobria a equipe comum e, passando dele,
  // esconderia um vendedor com acesso sem nada na tela dizer.
  const listInput = useMemo(
    () => ({
      filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
    }),
    [factoryId]
  );

  const { data, loading, error, refetch } = useCompleteList<SellersQueryData>(
    FACTORY_SELLER_ACCESSES_QUERY,
    listInput,
    getAccesses,
    { skip: !factoryId }
  );

  const initialAccesses = useMemo<SellerAccess[]>(
    () => data?.factory_seller_accesses?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<SellerAccess>({
    initialData: initialAccesses,
  });
  const accesses = optimistic.items;

  return (
    <Table.Root data-tour="factory-sellers-table">
      <Table.CardHead>
        <Table.CardHead.Title>
          Acesso de vendedores
          <HelpTooltip
            label="O que é o acesso de vendedor?"
            content={FACTORY_SELLERS_HELP}
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions data-tour="factory-sellers-actions">
          <AddSellerAccessModal
            factoryId={factoryId}
            autoOpen={autoOpenLink}
            onAddOptimistic={optimistic.addOptimistic}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada linha vira cartão, em vez de a tabela rolar de lado. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head title={FACTORY_SELLER_COLUMN_HELP.seller}>
              Vendedor
            </Table.Head>
            <Table.Head title={FACTORY_SELLER_COLUMN_HELP.access}>
              Acesso
            </Table.Head>
            <Table.Head title={FACTORY_SELLER_COLUMN_HELP.commission}>
              Comissão do vendedor
            </Table.Head>
            <Table.Head title={FACTORY_SELLER_COLUMN_HELP.grantedBy}>
              Concedido por
            </Table.Head>
            <Table.Head title={FACTORY_SELLER_COLUMN_HELP.date}>
              Data
            </Table.Head>
            <Table.Head
              className="text-right"
              title={FACTORY_SELLER_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && accesses.length === 0 ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : error && accesses.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : accesses.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Users />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum vendedor com acesso
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Conceder acesso&quot; para vincular um vendedor a
                    esta fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            accesses.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell card="title" flex>
                  <Avatar
                    size="sm"
                    color="neutral"
                    initials={personInitials(a.seller?.name) || "?"}
                  />
                  <Table.CellText variant="strong">
                    {a.seller?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell card="status">
                  <Badge.Root
                    color={a.isActive ? "green" : "neutral"}
                    appearance="tinted"
                  >
                    <Badge.Text>{a.isActive ? "Ativo" : "Inativo"}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell label="Comissão">
                  <Table.CellText variant="dim">
                    {sellerAgreementLabel(
                      a.sellerCommissionRate,
                      a.sellerCommissionBasis
                    )}
                  </Table.CellText>
                </Table.Cell>
                {/* Vazio em quase toda linha (acesso antigo, sem registro de
                    quem concedeu): no cartão só repetia "Não informado"
                    (crítica de 23/11/2026). */}
                <Table.Cell
                  label="Concedido por"
                  cardHidden={!a.grantedByUser?.name}
                >
                  <Table.CellText variant="dim">
                    {a.grantedByUser?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell label="Desde">
                  <Table.CellText variant="dim">
                    {formatDateDMY(a.createdAt)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell card="actions" flex className="justify-end">
                  <AccessRowActions
                    id={a.id}
                    sellerName={a.seller?.name ?? "este vendedor"}
                    sellerIsActive={a.seller?.isActive ?? true}
                    factoryName={factoryName}
                    factoryId={factoryId}
                    isActive={a.isActive}
                    sellerCommissionRate={a.sellerCommissionRate}
                    sellerCommissionBasis={a.sellerCommissionBasis}
                    onAgreementSaved={() => refetch()}
                    onRevoke={() =>
                      optimistic.updateOptimistic(a.id, {
                        isActive: !a.isActive,
                      })
                    }
                    onCommit={optimistic.commit}
                    onRollback={optimistic.rollback}
                    onRemove={() => optimistic.removeOptimistic(a.id)}
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
