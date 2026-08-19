"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { clientName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Coins } from "lucide-react";
import Link from "next/link";
import { CommissionRow } from "../../interface";
import { COMMISSION_STATUS_LABEL, COMMISSION_STATUS_TONE } from "../../utils";
import { ReconcileToggle } from "../ReconcileToggle";
import { CommissionRowActions } from "./CommissionRowActions";
import { InstallmentStateCell } from "./InstallmentStateCell";

interface Props {
  rows: CommissionRow[];
  loading: boolean;
  /** Gestor vê as colunas de conferência e repasse; vendedor só visualiza. */
  canManage: boolean;
  /** Parcelas marcadas para as ações em lote (só gestão). */
  selectedIds?: Set<string>;
  onToggleRow?: (installmentId: string) => void;
  onToggleAll?: () => void;
  onChanged: () => void;
}

/** Quando a comissão cai (ou caiu), na linguagem de cada situação. */
const whenLabel = (row: CommissionRow): string => {
  if (row.status === "received")
    return `Recebido em ${formatDateDMY(row.receiveDate ?? undefined)}`;
  if (row.status === "receivable")
    return `Receber em ${formatDateDMY(row.receiveDate ?? undefined)}`;
  if (row.status === "chargeback")
    return row.receiveDate
      ? `Desconto em ${formatDateDMY(row.receiveDate)}`
      : "Desconto a agendar";
  if (row.status === "pending")
    return row.receiveDate
      ? `Previsto p/ ${formatDateDMY(row.receiveDate)}`
      : "Aguardando pagamento";
  return "—";
};

export function CommissionsTable({
  rows,
  loading,
  canManage,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onChanged,
}: Props) {
  const selectable = canManage && !!onToggleRow;
  // Seleção + boleto + conferência/repasse: as colunas de gestão.
  const columns = 7 + (selectable ? 1 : 0) + (canManage ? 2 : 0);
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedIds?.has(row.installmentId));

  return (
    <Table.Table>
      <Table.Header>
        <Table.Row>
          {selectable && (
            <Table.Head>
              {/* `label` no checkbox vira texto visível; o nome acessível vai
                  no `aria-label` — sem ele o leitor de tela anuncia "caixa de
                  seleção" e nada mais. */}
              <Input.Checkbox
                label=""
                aria-label="Selecionar todas as parcelas desta fábrica"
                checked={allSelected}
                onChange={() => onToggleAll?.()}
              />
            </Table.Head>
          )}
          <Table.Head sortKey="client">Cliente</Table.Head>
          <Table.Head sortKey="order">Pedido</Table.Head>
          <Table.Head sortKey="sequence">Parcela</Table.Head>
          {/* Data e dinheiro abrem na ordem útil: o mais recente e o maior. */}
          <Table.Head sortKey="dueDate" sortFirst="desc">
            Boleto
          </Table.Head>
          <Table.Head sortKey="receiveDate" sortFirst="desc">
            Quando
          </Table.Head>
          <Table.Head sortKey="amount" sortFirst="desc" align="right">
            Comissão
          </Table.Head>
          <Table.Head sortKey="status">Situação</Table.Head>
          {canManage && (
            <Table.Head sortKey="reconciled">Conferência</Table.Head>
          )}
          {canManage && <Table.Head className="text-right">Ação</Table.Head>}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {loading ? (
          <Table.Skeleton columns={columns} rows={6} />
        ) : rows.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={columns}>
              <EmptyState.Root>
                <EmptyState.Icon>
                  <Coins size={32} />
                </EmptyState.Icon>
                <EmptyState.Title>Nenhuma comissão aqui</EmptyState.Title>
                <EmptyState.Description>
                  As comissões aparecem quando os pedidos são faturados. Fature
                  um pedido para gerar as parcelas e acompanhar o que há a
                  receber.
                </EmptyState.Description>
              </EmptyState.Root>
            </Table.Cell>
          </Table.Row>
        ) : (
          rows.map((row) => (
            <Table.Row key={row.installmentId}>
              {selectable && (
                <Table.Cell>
                  <Input.Checkbox
                    label=""
                    aria-label={`Selecionar a parcela ${row.sequence} de ${clientName(row.client)}`}
                    checked={selectedIds?.has(row.installmentId) ?? false}
                    onChange={() => onToggleRow?.(row.installmentId)}
                  />
                </Table.Cell>
              )}
              <Table.Cell variant="strong">{clientName(row.client)}</Table.Cell>
              <Table.Cell>
                <Link
                  href={`/orders/${row.orderId}`}
                  className="text-(--amber) hover:underline"
                >
                  {row.orderId.slice(0, 8).toUpperCase()}
                </Link>
              </Table.Cell>
              <Table.Cell>{row.sequence}</Table.Cell>
              <Table.Cell>
                <InstallmentStateCell row={row} />
              </Table.Cell>
              <Table.Cell>{whenLabel(row)}</Table.Cell>
              <Table.Cell className="text-right">
                {/* Estorno vem negativo: sai em vermelho para não ser lido como ganho. */}
                <Title
                  variant="body-sm"
                  color={row.status === "chargeback" ? "red" : undefined}
                  weight={row.status === "chargeback" ? "bold" : undefined}
                >
                  {formatMoney(row.amount)}
                </Title>
              </Table.Cell>
              <Table.Cell>
                <Badge.Root
                  color={COMMISSION_STATUS_TONE[row.status]}
                  appearance="tinted"
                >
                  <Badge.Text>{COMMISSION_STATUS_LABEL[row.status]}</Badge.Text>
                </Badge.Root>
              </Table.Cell>
              {canManage && (
                <Table.Cell>
                  <ReconcileToggle
                    installmentId={row.installmentId}
                    reconciled={row.isReconciled}
                    onChanged={onChanged}
                    locked={row.status === "received"}
                  />
                </Table.Cell>
              )}
              {canManage && (
                <Table.Cell>
                  <div className="flex items-center justify-end">
                    <CommissionRowActions row={row} onChanged={onChanged} />
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Table>
  );
}
