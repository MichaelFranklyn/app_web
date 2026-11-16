import { Alert } from "@/components/Alert";
import { Emphasis } from "@/components/Emphasis";
import { MessageSquareQuote } from "lucide-react";

import { OrderDetail } from "../../interface";
import { formatDiscountRequest } from "./utils";

interface Props {
  order: OrderDetail;
}

/**
 * O que o cliente pediu junto do orçamento do portal: um desconto e/ou um
 * recado. O desconto é um PEDIDO — os preços dos itens continuam os da
 * tabela; quem decide aplicar é o vendedor. Sem nenhum dos dois, não
 * renderiza nada.
 */
export function ClientRequestBanner({ order }: Props) {
  const discount = formatDiscountRequest(order.clientDiscountPercent);
  const note = order.clientRequestNote?.trim() || null;
  if (!discount && !note) return null;

  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={MessageSquareQuote} />
      <Alert.Content>
        <Alert.Description>
          {discount ? (
            <>
              O cliente pediu <Emphasis>{discount} de desconto</Emphasis>. Os
              preços abaixo ainda são os da tabela — aplique se concordar.
            </>
          ) : null}
          {discount && note ? " " : null}
          {note ? <>Recado do cliente: “{note}”</> : null}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
