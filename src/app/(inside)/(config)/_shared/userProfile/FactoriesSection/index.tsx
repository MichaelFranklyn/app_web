"use client";

import { Badge } from "@/components/Badges";
import { QueryError } from "@/components/QueryError";
import {
  AccessRowActions,
  sellerAgreementLabel,
} from "@/components/SellerFactoryAccess";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatDateDMY } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { AddFactoryAccessModal } from "./AddFactoryAccessModal";
import { FACTORY_ACCESS_COLUMN_HELP } from "./help";
import { SELLER_FACTORY_ACCESSES_QUERY } from "../gql";
import { FactoryAccessNode, SellerAccessesQueryResponse } from "../interface";
import { factoryName } from "@/utils/company";

interface Props {
  sellerId: string;
  /**
   * Nome de quem está sendo visto. Os modais do vínculo perguntam pelo par
   * ("revogar o acesso de Fulano à fábrica X?"), e aqui a pessoa é a página —
   * só a fábrica muda de linha para linha.
   */
  sellerName: string;
  /** Perfil de campo desligado impede reativar um acesso suspenso. */
  sellerIsActive: boolean;
  /**
   * Mexer no vínculo (comissão, suspensão, exclusão) é coisa de GESTÃO: no
   * próprio perfil a tabela é só leitura — ninguém combina a própria comissão,
   * nem revoga o próprio acesso. Quem gerencia faz pelo perfil da pessoa ou
   * pela aba de vendedores da fábrica.
   */
  canManage?: boolean;
}

export function FactoriesSection({
  sellerId,
  sellerName,
  sellerIsActive,
  canManage = false,
}: Props) {
  const { data, loading, error, refetch } =
    useQuery<SellerAccessesQueryResponse>(SELLER_FACTORY_ACCESSES_QUERY, {
      variables: {
        input: {
          first: 50,
          filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
        },
      },
    });

  const initialItems = useMemo<FactoryAccessNode[]>(
    () => data?.seller_accesses?.edges?.map((e) => e.node) ?? [],
    [data]
  );
  // Suspender e excluir mexem na linha na hora: sem a lista otimista, a tabela
  // só mudava depois do refetch e o clique parecia não ter feito nada.
  const optimistic = useOptimisticList<FactoryAccessNode>({
    initialData: initialItems,
  });
  const items = optimistic.items;
  const total = data?.seller_accesses?.totalCount ?? 0;
  // "Concedido por" só aparece quando alguma linha tem quem concedeu: nos
  // vínculos antigos e importados o campo é vazio, e a coluna inteira de "—"
  // só ocupava espaço (crítica de configurações, 23/11/2026).
  const hasGrantedBy = items.some((n) => n.grantedByUser?.name);
  const columns = 4 + (hasGrantedBy ? 1 : 0) + (canManage ? 1 : 0);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Fábricas com acesso</Table.CardHead.Title>
        {/* A contagem é texto de apoio, não tarja: como item das ações, no
            celular a tarja esticava na largura toda acima do botão
            (crítica de configurações, 23/11/2026). */}
        <Table.CardHead.Description>
          {total === 1 ? "1 fábrica" : `${total} fábricas`}
        </Table.CardHead.Description>
        <Table.CardHead.Actions>
          <AddFactoryAccessModal
            sellerId={sellerId}
            onAdded={() => refetch()}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Cartões abaixo do desktop, como as outras listas: no celular a
          tabela de 6 colunas rolava de lado (crítica de configurações,
          23/11/2026). Poucas linhas — sem a faixa de ordenação. */}
      <Table.Table cards cardSort={false}>
        <Table.Header>
          <Table.Row>
            <Table.Head title={FACTORY_ACCESS_COLUMN_HELP.factory}>
              Fábrica
            </Table.Head>
            <Table.Head title={FACTORY_ACCESS_COLUMN_HELP.status}>
              Status
            </Table.Head>
            <Table.Head title={FACTORY_ACCESS_COLUMN_HELP.commission}>
              Comissão do vendedor
            </Table.Head>
            {hasGrantedBy && (
              <Table.Head title={FACTORY_ACCESS_COLUMN_HELP.grantedBy}>
                Concedido por
              </Table.Head>
            )}
            <Table.Head title={FACTORY_ACCESS_COLUMN_HELP.date}>
              Data
            </Table.Head>
            {canManage && (
              <Table.Head
                className="text-right"
                title={FACTORY_ACCESS_COLUMN_HELP.actions}
              >
                Ações
              </Table.Head>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={columns} rows={5} />
          ) : error && items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <Title
                  variant="body-sm"
                  color="muted"
                  className="py-16 text-center"
                >
                  Nenhuma fábrica vinculada
                </Title>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((node) => (
              <Table.Row key={node.id}>
                <Table.Cell card="title">
                  <Table.CellText variant="strong">
                    {factoryName(node.factory)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell card="status">
                  <Badge.Root
                    color={node.isActive ? "green" : "red"}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      {node.isActive ? "Ativo" : "Inativo"}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell label="Comissão do vendedor">
                  <Table.CellText variant="dim">
                    {sellerAgreementLabel(
                      node.sellerCommissionRate,
                      node.sellerCommissionBasis
                    )}
                  </Table.CellText>
                </Table.Cell>
                {hasGrantedBy && (
                  <Table.Cell label="Concedido por" variant="dim" emptyText="—">
                    {node.grantedByUser?.name ?? "—"}
                  </Table.Cell>
                )}
                <Table.Cell label="Data">
                  <Table.CellText variant="dim">
                    {formatDateDMY(node.createdAt)}
                  </Table.CellText>
                </Table.Cell>
                {canManage && (
                  <Table.Cell card="actions" flex className="justify-end">
                    <AccessRowActions
                      id={node.id}
                      sellerName={sellerName}
                      sellerIsActive={sellerIsActive}
                      factoryName={factoryName(node.factory) ?? ""}
                      factoryId={node.factory?.id ?? ""}
                      isActive={node.isActive}
                      sellerCommissionRate={node.sellerCommissionRate}
                      sellerCommissionBasis={node.sellerCommissionBasis}
                      onAgreementSaved={() => refetch()}
                      onRevoke={() =>
                        optimistic.updateOptimistic(node.id, {
                          isActive: !node.isActive,
                        })
                      }
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onRemove={() => optimistic.removeOptimistic(node.id)}
                    />
                  </Table.Cell>
                )}
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
