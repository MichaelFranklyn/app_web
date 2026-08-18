"use client";

import { Badge } from "@/components/Badges";
import { BadgeCheck, Clock } from "lucide-react";
import { OrderInstallment } from "../../interface";
import { INSTALLMENT_STATUS_LABEL, INSTALLMENT_STATUS_TONE } from "../../utils";

/**
 * Situação de uma parcela: o status do boleto, mais os selos que contam o resto
 * da história — atraso (derivado da data, por isso não é status) e a comissão já
 * recebida da fábrica ou já repassada ao vendedor.
 */
export function InstallmentStatusCell({
  installment,
}: {
  installment: OrderInstallment;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Badge.Root
        color={INSTALLMENT_STATUS_TONE[installment.status]}
        appearance="tinted"
      >
        <Badge.Text>{INSTALLMENT_STATUS_LABEL[installment.status]}</Badge.Text>
      </Badge.Root>

      {installment.isOverdue && (
        <Badge.Root color="amber" appearance="tinted">
          <Badge.Icon>
            <Clock />
          </Badge.Icon>
          <Badge.Text>Vencido</Badge.Text>
        </Badge.Root>
      )}

      {installment.isCommissionReceived && (
        <Badge.Root color="green" appearance="tinted">
          <Badge.Icon>
            <BadgeCheck />
          </Badge.Icon>
          <Badge.Text>Comissão recebida</Badge.Text>
        </Badge.Root>
      )}

      {installment.isSellerCommissionPaid && (
        <Badge.Root color="subtle" appearance="tinted">
          <Badge.Text>Repassada ao vendedor</Badge.Text>
        </Badge.Root>
      )}
    </div>
  );
}
