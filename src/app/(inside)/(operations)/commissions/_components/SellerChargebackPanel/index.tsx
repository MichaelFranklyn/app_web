"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { clientName, factoryName } from "@/utils/company";
import { formatMoney } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { CalendarClock, Undo2 } from "lucide-react";
import { useMemo } from "react";
import { SCHEDULE_SELLER_CHARGEBACK_MUTATION } from "../../gql";
import { CommissionRow } from "../../interface";
import { monthLabel, YearMonth } from "../../utils";

interface Props {
  /** TODAS as linhas do vendedor — a fila não é recortada por mês. */
  rows: CommissionRow[];
  /** Mês aberto no navegador da página: é nele que o desconto é agendado. */
  month: YearMonth;
  onChanged: () => void;
}

/**
 * Estornos a descontar do vendedor.
 *
 * Quando o cliente dá calote numa parcela cuja fatia já foi repassada, o
 * escritório tem um valor a recuperar — mas escolhe QUANDO cobrar: descontar
 * tudo de uma vez pode zerar o mês do vendedor. Enquanto ninguém agenda, o
 * estorno fica aqui, e passa de mês sem sumir.
 */
export function SellerChargebackPanel({ rows, month, onChanged }: Props) {
  const [schedule] = useMutation<{
    scheduleSellerChargeback: { status: boolean; message: string };
  }>(SCHEDULE_SELLER_CHARGEBACK_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const queue = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.sellerStatus === "chargeback" &&
          row.sellerChargebackMonth === null
      ),
    [rows]
  );

  const scheduled = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.sellerStatus === "chargeback" &&
          row.sellerChargebackMonth !== null
      ),
    [rows]
  );

  const total = useMemo(
    () => queue.reduce((sum, row) => sum + Number(row.sellerAmount), 0),
    [queue]
  );

  if (queue.length === 0 && scheduled.length === 0) return null;

  const runSchedule = (installmentIds: string[], target: string | null) =>
    execute(
      async () => {
        const res = await schedule({
          variables: { installmentIds, month: target },
        });
        if (!res.data?.scheduleSellerChargeback?.status) {
          throw new Error(
            res.data?.scheduleSellerChargeback?.message ??
              "Erro ao agendar o desconto"
          );
        }
      },
      {
        successMessage: target
          ? `Desconto agendado para ${monthLabel(month)}`
          : "Estorno devolvido para a fila",
        onSuccess: onChanged,
      }
    );

  // Primeiro dia do mês aberto: o que se escolhe é o fechamento, não o dia.
  const targetMonth = `${month.year}-${String(month.month).padStart(2, "0")}-01`;

  return (
    <Table.Root>
      <div className="flex flex-wrap items-center gap-16 p-16">
        <div className="flex flex-1 flex-col gap-2">
          <Title variant="heading-sm">Estornos a descontar do vendedor</Title>
          <Title variant="caption" color="muted">
            Comissão já repassada de boletos que o cliente não pagou. Enquanto
            você não escolher o mês, o valor continua aqui.
          </Title>
        </div>
        <div className="flex flex-wrap items-center gap-16">
          <div className="flex flex-col items-end">
            <Title variant="caption" color="muted">
              Na fila
            </Title>
            <Title variant="body-sm" color="red" weight="semibold">
              {formatMoney(total)}
            </Title>
          </div>
          {queue.length > 0 && (
            <Button.Root
              appearance="tinted"
              color="red"
              size="sm"
              noUppercase
              loading={isLoading}
              onClick={() =>
                runSchedule(
                  queue.map((row) => row.installmentId),
                  targetMonth
                )
              }
            >
              <Button.Icon icon={CalendarClock} />
              <Button.Title>Descontar tudo em {monthLabel(month)}</Button.Title>
            </Button.Root>
          )}
        </div>
      </div>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head className="text-right">Valor</Table.Head>
            <Table.Head>Desconto</Table.Head>
            <Table.Head className="text-right">Ação</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[...queue, ...scheduled].map((row) => (
            <Table.Row key={row.installmentId}>
              <Table.Cell variant="strong">{clientName(row.client)}</Table.Cell>
              <Table.Cell>{factoryName(row.factory)}</Table.Cell>
              <Table.Cell className="text-right">
                <Title variant="body-sm" color="red" weight="bold">
                  {formatMoney(row.sellerAmount)}
                </Title>
              </Table.Cell>
              <Table.Cell>
                {row.sellerChargebackMonth ? (
                  <Badge.Root color="red" appearance="tinted">
                    <Badge.Text>
                      {monthLabel({
                        year: Number(row.sellerChargebackMonth.slice(0, 4)),
                        month: Number(row.sellerChargebackMonth.slice(5, 7)),
                      })}
                    </Badge.Text>
                  </Badge.Root>
                ) : (
                  <Table.CellText variant="dim">Não agendado</Table.CellText>
                )}
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center justify-end">
                  {row.sellerChargebackMonth ? (
                    <Button.Root
                      appearance="ghost"
                      color="neutral"
                      size="sm"
                      noUppercase
                      onClick={() => runSchedule([row.installmentId], null)}
                    >
                      <Button.Icon icon={Undo2} />
                      <Button.Title>Voltar para a fila</Button.Title>
                    </Button.Root>
                  ) : (
                    <Button.Root
                      appearance="ghost"
                      color="red"
                      size="sm"
                      noUppercase
                      onClick={() =>
                        runSchedule([row.installmentId], targetMonth)
                      }
                    >
                      <Button.Icon icon={CalendarClock} />
                      <Button.Title>
                        Descontar em {monthLabel(month)}
                      </Button.Title>
                    </Button.Root>
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
