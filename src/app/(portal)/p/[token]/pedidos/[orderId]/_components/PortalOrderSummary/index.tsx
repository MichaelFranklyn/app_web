import { Title } from "@/components/Title";
import { PortalFinancialSummary } from "../../../../_components/PortalFinancialSummary";
import { PortalOrderDetail } from "../../../../interface";
import { portalStatusHint } from "../../../../utils";

interface PortalOrderSummaryProps {
  order: PortalOrderDetail;
}

/**
 * O resumo da coluna lateral: o "Resumo financeiro" do sistema (mercadoria,
 * impostos, IPI, total, prazo e frete) e, embaixo, o que acontece agora. A
 * situação (badge) fica no cabeçalho, como no detalhe de pedido do sistema.
 */
export function PortalOrderSummary({ order }: PortalOrderSummaryProps) {
  return (
    <PortalFinancialSummary
      amounts={order}
      paymentTermName={order.paymentTermName}
      freightType={order.freightType}
    >
      <Title variant="body-sm">{portalStatusHint(order.status)}</Title>
    </PortalFinancialSummary>
  );
}
