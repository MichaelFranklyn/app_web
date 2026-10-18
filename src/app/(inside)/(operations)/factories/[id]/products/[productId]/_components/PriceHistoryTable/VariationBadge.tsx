import { Badge } from "@/components/Badges";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  variationPct: string | null;
}

const formatPct = (value: number): string =>
  `${Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** Subiu em vermelho, caiu em verde — do ponto de vista de quem compra. */
export function VariationBadge({ variationPct }: Props) {
  if (variationPct === null) {
    return (
      <Badge.Root color="neutral" appearance="tinted">
        <Badge.Text>Primeiro preço</Badge.Text>
      </Badge.Root>
    );
  }
  const value = Number(variationPct);
  const isUp = value > 0;
  return (
    <Badge.Root color={isUp ? "red" : "green"} appearance="tinted">
      <Badge.Icon>{isUp ? <TrendingUp /> : <TrendingDown />}</Badge.Icon>
      <Badge.Text>
        {isUp ? "+" : "−"}
        {formatPct(value)}
      </Badge.Text>
    </Badge.Root>
  );
}
