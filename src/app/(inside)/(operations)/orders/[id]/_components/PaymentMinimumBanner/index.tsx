import { Alert } from "@/components/Alert";
import { formatMoney } from "@/utils/format/masks";
import { AlertTriangle } from "lucide-react";

import { OrderDetail } from "../../interface";
import { reachableTermNames } from "./utils";

interface Props {
  order: OrderDetail;
}

/**
 * Aviso de que o pedido ainda não alcança o valor mínimo da condição de
 * pagamento escolhida.
 *
 * Aparece enquanto o pedido é orçamento/rascunho — antes do clique em
 * "Converter em pedido", que é onde o servidor barra. Ninguém perde trabalho ao
 * esbarrar na regra (o pedido e os itens já estão salvos), mas descobrir aqui
 * evita a ida e volta: a saída, incluir itens ou trocar de condição, já vem
 * escrita, com os prazos que este valor alcança.
 */
export function PaymentMinimumBanner({ order }: Props) {
  const isQuote = order.status === "DRAFT" || order.status === "SENT";
  const minimum = order.paymentTerm?.minOrderAmount ?? null;
  if (!isQuote || !minimum) return null;

  // Mercadoria pura, sem IPI e sem frete — a base que o servidor compara.
  const total = Number(order.totalAmount);
  const missing = minimum - total;
  if (missing <= 0) return null;

  const alternatives = reachableTermNames(total, order.availablePaymentTerms);

  return (
    <Alert.Root variant="warning">
      <Alert.Icon icon={AlertTriangle} />
      <Alert.Content>
        <Alert.Title>
          Faltam {formatMoney(missing.toFixed(2))} para a condição{" "}
          {order.paymentTerm?.name}
        </Alert.Title>
        <Alert.Description>
          A fábrica pede no mínimo {formatMoney(minimum.toFixed(2))} em
          mercadoria neste prazo, e este pedido soma{" "}
          {formatMoney(total.toFixed(2))}. Inclua mais itens
          {alternatives.length > 0
            ? ` ou troque a condição de pagamento para ${alternatives.join(", ")}, que este valor já alcança`
            : ""}
          . Enquanto isso o pedido fica salvo como orçamento — nada se perde.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
