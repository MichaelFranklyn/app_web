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
import { Title } from "@/components/Title";
import { FACTORY_SELLER_COLUMN_HELP } from "../../../help";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatDateDMY } from "@/utils/format/masks";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { AddSellerAccessModal } from "./AddSellerAccessModal";
import { FACTORY_SELLER_ACCESSES_QUERY } from "./gql";

interface SellerAccess {
  id: string;
  isActive: boolean;
  createdAt: string;
  /** Percentual do PEDIDO que fica com o vendedor; nulo = a comissão inteira. */
  sellerCommissionRate: string | number | null;
  /** Quando o escritório repassa; nulo = mesma base da fábrica. */
  sellerCommissionBasis: string | null;
  seller: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  grantedByUser: { id: string; name: string } | null;
}

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
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Acesso de vendedores
          <HelpTooltip
            label="O que é o acesso de vendedor?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Acesso de vendedor
                </Title>
                <Title variant="body-sm">
                  Diz quais vendedores podem vender os produtos desta fábrica.
                  Só vendedores com acesso <b>ativo</b> aparecem na hora de
                  vincular clientes e registrar pedidos dela.
                </Title>
                <Title variant="body-sm">
                  É aqui também que se combina <b>a comissão de cada um</b>
                  nesta fábrica: o percentual que ele ganha por pedido e quando
                  o escritório repassa.
                </Title>
                <Title variant="body-sm" color="muted">
                  <b>Desativar</b> pausa as vendas e pode ser desfeito quando
                  quiser. <b>Excluir</b> tira o vendedor desta lista. Nos dois
                  casos os pedidos já feitos continuam guardados.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions data-tour="factory-sellers-actions">
          <AddSellerAccessModal factoryId={factoryId} autoOpen={autoOpenLink} />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
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
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
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
                <Table.Cell flex>
                  <Avatar
                    size="sm"
                    color="neutral"
                    initials={(a.seller?.name ?? "?").slice(0, 2).toUpperCase()}
                  />
                  <Table.CellText variant="strong">
                    {a.seller?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={a.isActive ? "green" : "neutral"}
                    appearance="tinted"
                  >
                    <Badge.Text>{a.isActive ? "Ativo" : "Inativo"}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {sellerAgreementLabel(
                      a.sellerCommissionRate,
                      a.sellerCommissionBasis
                    )}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {a.grantedByUser?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {formatDateDMY(a.createdAt)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell flex className="justify-end">
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
