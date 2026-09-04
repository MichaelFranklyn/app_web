"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
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
import { Headset } from "lucide-react";
import { useMemo } from "react";

interface Props {
  cases: SupportCase[];
}

const COLUMNS = 5;

/**
 * Os casos do cliente, ABERTOS primeiro.
 *
 * A separação não é enfeite: quem abre esta aba está com o cliente na linha, e
 * o que importa é "o que ainda está pendente com ele?". O histórico encerrado
 * vem abaixo, na mesma tabela, porque é ele que responde "isso já aconteceu
 * antes?".
 */
export function ClientSupportList({ cases }: Props) {
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
          {openCount > 0
            ? `${openCount} atendimento(s) em aberto`
            : "Atendimentos"}
        </Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
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
          {ordered.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Headset size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum atendimento registrado
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Quando este cliente reclamar de algo — mercadoria,
                    pagamento, entrega — registre aqui para acompanhar a
                    tratativa com a fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            ordered.map((item) => (
              <Table.Row key={item.id} href={`/support/${item.id}`}>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      {item.title}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {`${SUPPORT_CATEGORY_LABEL[item.category]} · desde ${formatDate(item.reportedAt)}`}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {item.factory ? factoryName(item.factory) : "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={SUPPORT_STATUS_COLOR[item.status]}
                    appearance="tinted"
                    title={SUPPORT_STATUS_HINT[item.status]}
                  >
                    <Badge.Text>{SUPPORT_STATUS_LABEL[item.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {supportAgeLabel(item.ageDays, item.isOpen)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
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
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
