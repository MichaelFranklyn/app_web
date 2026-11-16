import { Badge } from "@/components/Badges";
import { PortalSentOrder } from "../../../interface";
import { sentOrderLabel, sentOrderStage, sentOrderTone } from "../../utils";

interface SentOrderBadgeProps {
  order: Pick<PortalSentOrder, "status" | "seenBySellerAt">;
  /** `md` no cabeçalho do detalhe: a mesma altura dos botões ao lado. */
  size?: "sm" | "md";
}

/** A situação do pedido enviado — a mesma na lista e no detalhe. */
export function SentOrderBadge({ order, size = "sm" }: SentOrderBadgeProps) {
  const stage = sentOrderStage(order);
  return (
    <Badge color={sentOrderTone(stage)} size={size}>
      <Badge.Text>{sentOrderLabel(stage)}</Badge.Text>
    </Badge>
  );
}
