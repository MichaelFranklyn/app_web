"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { clientName, factoryName } from "@/utils/company";
import { formatMoney } from "@/utils/format/masks";
import { LucideIcon } from "lucide-react";

import { CommissionRow } from "../../interface";
import { monthLabel } from "../../utils";

export interface SectionAction {
  label: string;
  icon: LucideIcon;
  color: "red" | "green" | "neutral";
  onRun: (installmentIds: string[]) => void;
  /** Aparece no cabeçalho, aplicando a ação a todas as linhas da seção. */
  bulkLabel?: string;
}

interface Props {
  title: string;
  hint: string;
  rows: CommissionRow[];
  tone: "red" | "green" | "neutral";
  /** Vazio para o vendedor: ele acompanha, quem age é o escritório. */
  actions?: SectionAction[];
  isLoading?: boolean;
}

const monthOf = (iso: string) =>
  monthLabel({
    year: Number(iso.slice(0, 4)),
    month: Number(iso.slice(5, 7)),
  });

/**
 * Um estado do estorno e as linhas nele.
 *
 * Cada seção responde a uma pergunta diferente — "o que ainda vou descontar",
 * "o que já saiu", "o que preciso devolver" — e por isso tem ações próprias. Um
 * bloco só, com tudo misturado, obrigava a ler o mês de cada linha para saber o
 * que fazer com ela.
 */
export function ChargebackSection({
  title,
  hint,
  rows,
  tone,
  actions = [],
  isLoading,
}: Props) {
  if (rows.length === 0) return null;

  const total = rows.reduce((sum, row) => sum + Number(row.sellerAmount), 0);
  const allIds = rows.map((row) => row.installmentId);
  const bulk = actions.find((action) => action.bulkLabel);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-16 px-16 pt-16">
        <div className="flex flex-1 flex-col gap-2">
          <Title variant="label">{title}</Title>
          <Title variant="caption" color="muted">
            {hint}
          </Title>
        </div>
        <div className="flex flex-wrap items-center gap-16">
          <Title
            variant="body-sm"
            color={tone === "green" ? "green" : "red"}
            weight="semibold"
          >
            {formatMoney(total)}
          </Title>
          {bulk && rows.length > 1 && (
            <Button.Root
              appearance="tinted"
              color={bulk.color}
              size="sm"
              noUppercase
              loading={isLoading}
              onClick={() => bulk.onRun(allIds)}
            >
              <Button.Icon icon={bulk.icon} />
              <Button.Title>{bulk.bulkLabel}</Button.Title>
            </Button.Root>
          )}
        </div>
      </div>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="cbClient">Cliente</Table.Head>
            <Table.Head sortKey="cbFactory">Fábrica</Table.Head>
            <Table.Head sortKey="cbAmount" sortFirst="desc" align="right">
              Valor
            </Table.Head>
            <Table.Head sortKey="cbMonth" sortFirst="desc">
              Mês do desconto
            </Table.Head>
            {actions.length > 0 && (
              <Table.Head className="text-right">Ação</Table.Head>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.installmentId}>
              <Table.Cell variant="strong">{clientName(row.client)}</Table.Cell>
              <Table.Cell>{factoryName(row.factory)}</Table.Cell>
              <Table.Cell className="text-right">
                <Title
                  variant="body-sm"
                  color={tone === "green" ? "green" : "red"}
                  weight="bold"
                >
                  {formatMoney(row.sellerAmount)}
                </Title>
              </Table.Cell>
              <Table.Cell>
                {row.sellerChargebackSettledAt ? (
                  <Badge.Root color="neutral" appearance="tinted">
                    <Badge.Text>
                      Saiu em {monthOf(row.sellerChargebackSettledAt)}
                    </Badge.Text>
                  </Badge.Root>
                ) : row.sellerChargebackMonth ? (
                  <Badge.Root color="red" appearance="tinted">
                    <Badge.Text>
                      {monthOf(row.sellerChargebackMonth)}
                    </Badge.Text>
                  </Badge.Root>
                ) : (
                  <Table.CellText variant="dim">A definir</Table.CellText>
                )}
              </Table.Cell>
              {actions.length > 0 && (
                <Table.Cell>
                  <div className="flex items-center justify-end gap-8">
                    {actions.map((action) => (
                      <Button.Root
                        key={action.label}
                        appearance="ghost"
                        color={action.color}
                        size="sm"
                        noUppercase
                        onClick={() => action.onRun([row.installmentId])}
                      >
                        <Button.Icon icon={action.icon} />
                        <Button.Title>{action.label}</Button.Title>
                      </Button.Root>
                    ))}
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </div>
  );
}
