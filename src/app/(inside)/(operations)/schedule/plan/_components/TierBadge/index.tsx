import { Badge } from "@/components/Badges";

import { PriorityTier } from "../../interface";
import { TIER_COLOR, TIER_HINT, TIER_LABEL } from "../../utils";

interface Props {
  tier: PriorityTier;
  className?: string;
}

/**
 * A faixa do cliente na fila ("Prioridade máxima"…), com a explicação no
 * hover. `sm`, como os selos de score ao lado: mesma altura no card.
 */
export function TierBadge({ tier, className }: Props) {
  return (
    <Badge.Root
      color={TIER_COLOR[tier]}
      appearance="tinted"
      size="sm"
      title={TIER_HINT[tier]}
      className={className}
    >
      <Badge.Text>{TIER_LABEL[tier]}</Badge.Text>
    </Badge.Root>
  );
}
