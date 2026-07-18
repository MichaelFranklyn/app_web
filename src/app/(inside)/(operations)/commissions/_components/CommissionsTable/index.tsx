"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { clientName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Coins } from "lucide-react";
import Link from "next/link";
import { CommissionRow } from "../../interface";
import { COMMISSION_STATUS_LABEL, COMMISSION_STATUS_TONE } from "../../utils";
import { MarkReceivedModal } from "../MarkReceivedModal";
import { ReconcileToggle } from "../ReconcileToggle";

interface Props {
  rows: CommissionRow[];
  loading: boolean;
  /** Gestor vê as colunas de conferência e repasse; vendedor só visualiza. */
  canManage: boolean;
  onChanged: () => void;
}

export function CommissionsTable({
  rows,
  loading,
  canManage,
  onChanged,
}: Props) {
  // Colunas de "bater valores" (conferência + ação de repasse) só para gestão.
  const columns = canManage ? 8 : 6;
  return (
    <Table.Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Cliente</Table.Head>
          <Table.Head>Pedido</Table.Head>
          <Table.Head>Parcela</Table.Head>
          <Table.Head>Quando</Table.Head>
          <Table.Head className="text-right">Comissão</Table.Head>
          <Table.Head>Situação</Table.Head>
          {canManage && <Table.Head>Conferência</Table.Head>}
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
                {row.status === "received"
                  ? `Recebido em ${formatDateDMY(row.receiveDate ?? undefined)}`
                  : row.status === "receivable"
                    ? `Receber em ${formatDateDMY(row.receiveDate ?? undefined)}`
                    : row.status === "pending"
                      ? row.receiveDate
                        ? `Previsto p/ ${formatDateDMY(row.receiveDate)}`
                        : "Aguardando pagamento"
                      : "—"}
              </Table.Cell>
              <Table.Cell className="text-right">
                {formatMoney(row.amount)}
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
                    {row.isReceivable ? (
                      <MarkReceivedModal
                        installmentIds={[row.installmentId]}
                        onSuccess={onChanged}
                      />
                    ) : (
                      <Table.CellText variant="dim">—</Table.CellText>
                    )}
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
