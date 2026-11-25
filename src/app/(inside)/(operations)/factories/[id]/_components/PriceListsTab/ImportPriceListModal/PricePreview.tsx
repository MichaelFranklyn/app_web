import { Card } from "@/components/Card";
import { SampleRow } from "@/components/SampleRow";
import { Title } from "@/components/Title";
import { formatMoney, formatQuantity } from "@/utils/format/masks";

import { ImportPreviewRow } from "./preview";

interface Props {
  rows: ImportPreviewRow[];
  pricesPerUnit: boolean;
  title?: string;
}

const packText = (row: ImportPreviewRow): string => {
  if (row.packDefaulted) return "sem embalagem na planilha (contamos 1)";
  if (row.unitPerPack === 1) return "vendido por unidade";
  return `embalagem com ${formatQuantity(row.unitPerPack)}`;
};

const priceText = (
  row: ImportPreviewRow,
  unitPrice: number,
  pricesPerUnit: boolean
): string => {
  if (!pricesPerUnit || row.unitPerPack === 1) {
    return `${formatMoney(unitPrice)} a embalagem`;
  }
  return `${formatMoney(unitPrice)} cada unidade → ${formatMoney(
    unitPrice * row.unitPerPack
  )} a embalagem`;
};

/**
 * Produtos reais da planilha com o preço do jeito que vai ser gravado. É a
 * conferência que faltava: ver "Torneira — R$ 16,92 a caixa" e reconhecer o
 * valor, em vez de confiar no nome da coluna.
 */
export function PricePreview({
  rows,
  pricesPerUnit,
  title = "Exemplo com produtos da planilha",
}: Props) {
  if (rows.length === 0) return null;
  return (
    <Card.Root inset>
      <Card.Body padding="sm">
        <Title variant="caption" color="muted">
          {title} — confira se os preços batem com o que a fábrica mandou:
        </Title>
        <div className="flex flex-col">
          {rows.map((row, index) => (
            <SampleRow
              key={`${row.sku}-${index}`}
              label={row.name}
              detail={`Código ${row.sku} · ${packText(row)}`}
            >
              {row.prices.map((price) => (
                <Title key={price.tierName} variant="caption">
                  {price.tierName}:{" "}
                  {priceText(row, price.unitPrice, pricesPerUnit)}
                </Title>
              ))}
            </SampleRow>
          ))}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
