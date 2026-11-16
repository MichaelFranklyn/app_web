import { Badge } from "@/components/Badges";
import { formatMoney } from "@/utils/format/masks";
import { productCountLabel } from "../../utils";

interface OrderEstimateBadgeProps {
  count: number;
  /** Total estimado; nulo quando algum produto não tem preço. */
  estimate: number | null;
}

/**
 * Quanto a lista está dando — no cabeçalho, ao lado do "Enviar", para o
 * cliente ver o valor sem rolar até a caixa da lista. `md`: a mesma altura
 * do botão.
 */
export function OrderEstimateBadge({
  count,
  estimate,
}: OrderEstimateBadgeProps) {
  const text =
    count === 0
      ? "Lista vazia"
      : estimate !== null
        ? `${productCountLabel(count)} · ${formatMoney(estimate)}`
        : productCountLabel(count);

  return (
    <Badge.Root
      appearance="tinted"
      color={count === 0 ? "neutral" : "amber"}
      size="md"
      title={estimate !== null ? "Total estimado da lista" : undefined}
    >
      <Badge.Text>{text}</Badge.Text>
    </Badge.Root>
  );
}
