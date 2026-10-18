import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";

import { PurchasePrice } from "./interface";

interface Props {
  purchases: PurchasePrice[] | undefined;
}

/** "última R$ 4,10" embaixo do preço do item: a régua sem abrir o item. */
export function LastPriceHint({ purchases }: Props) {
  const last = purchases?.[0];
  if (!last) return null;
  return (
    <Title
      variant="caption"
      color="muted"
      title="O que este cliente pagou por unidade na última compra"
    >
      última {formatMoney(Number(last.netUnitPrice))}
    </Title>
  );
}
