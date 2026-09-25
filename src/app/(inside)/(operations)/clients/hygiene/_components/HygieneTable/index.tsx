"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Tooltip } from "@/components/Tooltip";
import { formatDate } from "@/utils/format/date";
import { maskCNPJ } from "@/utils/format/masks";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { HygieneActions } from "../../../_shared/hygiene/HygieneActions";
import { HYGIENE_REASON } from "../../help";
import { HygieneItem } from "../../interface";

interface Props {
  items: HygieneItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onChanged: () => void;
}

const COLUMNS = 5;

/** O nome como a empresa conhece o cliente, e o oficial embaixo. */
const names = (
  client: NonNullable<HygieneItem["companyClient"]["client"]>
) => ({
  main: client.nickname ?? client.razaoSocial,
  sub: client.nickname ? client.razaoSocial : client.nomeFantasia,
});

/**
 * Os suspeitos, cada um com o PORQUÊ e as ações ali mesmo.
 *
 * O porquê vem antes da decisão: "sem compra há mais de 1 ano" pede uma
 * ligação, "CNPJ fora de operação" quase sempre pede "não existe mais". A
 * ação sai da linha assim que é tomada (a lista só mostra quem está ativo).
 */
export function HygieneTable({
  items,
  loading,
  error,
  onRetry,
  onChanged,
}: Props) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Para revisar</Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head title="O sinal de que o cadastro pode estar desatualizado. Passe o mouse no selo para ver o que ele quer dizer.">
              Por que está aqui
            </Table.Head>
            <Table.Head title="Data do último pedido feito (orçamento e cancelado não contam).">
              Última compra
            </Table.Head>
            <Table.Head title="Situação do CNPJ na Receita Federal na última conferência.">
              Receita
            </Table.Head>
            <Table.Head className="text-right">O que aconteceu</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={COLUMNS} rows={5} />
          ) : error && items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <QueryError flat onRetry={onRetry} />
              </Table.Cell>
            </Table.Row>
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CheckCircle2 size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Carteira em dia</EmptyState.Title>
                  <EmptyState.Description>
                    Nenhum cliente ativo com sinal de cadastro desatualizado.
                    Confira a carteira na Receita de tempos em tempos para achar
                    quem fechou.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((item) => {
              const client = item.companyClient.client;
              if (!client) return null;
              const { main, sub } = names(client);
              return (
                <Table.Row key={item.companyClient.id}>
                  <Table.Cell>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/clients/${item.companyClient.id}/overview`}
                        className="hover:text-(--amber)"
                      >
                        <Table.CellText variant="strong" className="block">
                          {main}
                        </Table.CellText>
                      </Link>
                      {sub && (
                        <Table.CellText variant="dim" className="block">
                          {sub}
                        </Table.CellText>
                      )}
                      <Table.CellText variant="dim" className="block">
                        CNPJ {maskCNPJ(client.cnpj)}
                      </Table.CellText>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-4">
                      {item.reasons.map((reason) => (
                        <Tooltip
                          key={reason}
                          className="max-w-100 whitespace-normal"
                          content={HYGIENE_REASON[reason].help}
                        >
                          <Badge.Root
                            color={HYGIENE_REASON[reason].color}
                            appearance="tinted"
                          >
                            <Badge.Text>
                              {HYGIENE_REASON[reason].label}
                            </Badge.Text>
                          </Badge.Root>
                        </Tooltip>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {item.lastOrderDate
                        ? formatDate(item.lastOrderDate)
                        : "Nunca"}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {item.receitaStatus ?? "Não conferido"}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end">
                      <HygieneActions
                        companyClientId={item.companyClient.id}
                        clientName={main}
                        status={item.companyClient.status}
                        onChanged={onChanged}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
