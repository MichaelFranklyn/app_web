import { RowList } from "@/components/RowList";
import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { PortalInstallment } from "../../../../interface";
import { installmentLabel } from "../../../../utils";

interface PortalOrderInstallmentsProps {
  installments: PortalInstallment[];
}

/**
 * As parcelas do pedido faturado.
 *
 * Some por completo antes do faturamento — é ele que gera as parcelas, e um
 * bloco vazio dizendo "nenhuma parcela" num pedido recém-confirmado sugere que
 * algo deu errado, quando é só cedo demais.
 */
export function PortalOrderInstallments({
  installments,
}: PortalOrderInstallmentsProps) {
  if (installments.length === 0) return null;

  return (
    <Card.Root className="h-auto">
      <Card.Header>
        <Card.Header.Title>Pagamento</Card.Header.Title>
        <Card.Header.Description>
          {installments.length === 1
            ? "Parcela única"
            : `${installments.length} parcelas`}
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        <RowList.Root>
          {installments.map((installment) => (
            <RowList.Item
              key={installment.sequence}
              className="flex items-center justify-between gap-12"
            >
              <div className="flex min-w-0 flex-col gap-2">
                <Title variant="body-sm">
                  {installment.sequence}ª ·{" "}
                  {installment.dueDate
                    ? `vence ${formatDate(installment.dueDate)}`
                    : "sem vencimento"}
                </Title>
                {installment.paidAt ? (
                  <Title variant="body-xs" color="muted">
                    Pago em {formatDate(installment.paidAt)}
                  </Title>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-8">
                <Title variant="body-sm" weight="semibold">
                  {formatMoney(installment.amount)}
                </Title>
                <Badge.Root
                  color={installment.status === "PAID" ? "green" : "neutral"}
                  size="xs"
                >
                  <Badge.Text>
                    {installmentLabel(installment.status)}
                  </Badge.Text>
                </Badge.Root>
              </div>
            </RowList.Item>
          ))}
        </RowList.Root>
      </Card.Body>
    </Card.Root>
  );
}
