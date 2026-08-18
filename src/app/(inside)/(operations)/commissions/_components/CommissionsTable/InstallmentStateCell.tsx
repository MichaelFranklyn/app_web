"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { formatDateDMY } from "@/utils/format/masks";
import { CommissionRow } from "../../interface";

/**
 * Situação do BOLETO do cliente — o que trava a comissão.
 *
 * Fica numa coluna própria porque não se confunde com a situação da comissão:
 * um boleto vencido pode ter comissão a receber (modo Faturamento) e um boleto
 * pago pode ter comissão ainda prevista.
 */
export function InstallmentStateCell({ row }: { row: CommissionRow }) {
  if (row.defaultedAt) {
    return (
      <Badge.Root color="red" appearance="tinted">
        <Badge.Text>Não pagou · {formatDateDMY(row.defaultedAt)}</Badge.Text>
      </Badge.Root>
    );
  }

  if (row.isOverdue) {
    return (
      <Badge.Root color="amber" appearance="tinted">
        <Badge.Text>
          Vencido em {formatDateDMY(row.dueDate ?? undefined)}
        </Badge.Text>
      </Badge.Root>
    );
  }

  if (row.paidAt) {
    return (
      <Table.CellText variant="dim">
        Pago em {formatDateDMY(row.paidAt)}
      </Table.CellText>
    );
  }

  return (
    <Table.CellText variant="dim">
      {row.dueDate ? `Vence em ${formatDateDMY(row.dueDate)}` : "—"}
    </Table.CellText>
  );
}
