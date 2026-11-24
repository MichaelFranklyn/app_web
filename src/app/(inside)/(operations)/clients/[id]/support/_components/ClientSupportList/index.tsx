"use client";

import { Badge } from "@/components/Badges";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_STATUS_COLOR,
  SUPPORT_STATUS_HINT,
  SUPPORT_STATUS_LABEL,
  SupportCase,
  isSupportCaseOpen,
  supportAgeLabel,
} from "@/utils/support";
import { ReactNode, useMemo } from "react";

interface Props {
  cases: SupportCase[];
  /** O que entra aqui — vai na dica ao lado do título. */
  help: ReactNode;
  /** "Registrar reclamação", no canto do card. */
  action: ReactNode;
}

/**
 * Os casos do cliente, ABERTOS primeiro.
 *
 * A separação não é enfeite: quem abre esta aba está com o cliente na linha, e
 * o que importa é "o que ainda está pendente com ele?". O histórico encerrado
 * vem abaixo, na mesma tabela, porque é ele que responde "isso já aconteceu
 * antes?".
 */
export function ClientSupportList({ cases, help, action }: Props) {
  const ordered = useMemo(() => {
    const open = cases.filter((c) => isSupportCaseOpen(c.status));
    const closed = cases.filter((c) => !isSupportCaseOpen(c.status));
    const byReported = (a: SupportCase, b: SupportCase) =>
      b.reportedAt.localeCompare(a.reportedAt);
    return [...open.sort(byReported), ...closed.sort(byReported)];
  }, [cases]);

  const openCount = ordered.filter((c) => isSupportCaseOpen(c.status)).length;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          Reclamações deste cliente
          <HelpTooltip label="O que entra aqui?" content={help} />
          {openCount > 0 && (
            <Badge.Root color="warning" appearance="tinted" size="sm">
              <Badge.Text>{`${openCount} em aberto`}</Badge.Text>
            </Badge.Root>
          )}
        </Table.CardHead.Title>
        <Table.CardHead.Actions>{action}</Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada caso vira um cartão: a tabela rolando de lado
          cortava o estado vazio e deixava as colunas fora da tela. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Assunto</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head>Tempo</Table.Head>
            <Table.Head>Último andamento</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ordered.map((item) => (
            <Table.Row key={item.id} href={`/support/${item.id}`}>
              <Table.Cell card="title">
                <div className="flex flex-col">
                  <Table.CellText variant="strong">{item.title}</Table.CellText>
                  <Table.CellText variant="dim">
                    {`${SUPPORT_CATEGORY_LABEL[item.category]} · desde ${formatDate(item.reportedAt)}`}
                  </Table.CellText>
                </div>
              </Table.Cell>
              <Table.Cell label="Fábrica">
                <Table.CellText variant="dim">
                  {item.factory ? factoryName(item.factory) : "—"}
                </Table.CellText>
              </Table.Cell>
              {/* No cartão a tag leva o rótulo na frente ("Status: [Aberta]"). */}
              <Table.Cell card="status" label="Status">
                <Badge.Root
                  color={SUPPORT_STATUS_COLOR[item.status]}
                  appearance="tinted"
                  title={SUPPORT_STATUS_HINT[item.status]}
                >
                  <Badge.Text>{SUPPORT_STATUS_LABEL[item.status]}</Badge.Text>
                </Badge.Root>
              </Table.Cell>
              <Table.Cell label="Tempo">
                <Table.CellText variant="dim">
                  {supportAgeLabel(item.ageDays, item.isOpen)}
                </Table.CellText>
              </Table.Cell>
              <Table.Cell label="Último andamento">
                <div className="flex flex-col">
                  {item.lastUpdate ? (
                    <>
                      <Table.CellText variant="dim">
                        {item.lastUpdate.body}
                      </Table.CellText>
                      <Table.CellText variant="dim">
                        {formatDate(item.lastUpdate.createdAt)}
                      </Table.CellText>
                    </>
                  ) : (
                    <Title variant="body-xs" color="muted">
                      Sem andamento ainda
                    </Title>
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
