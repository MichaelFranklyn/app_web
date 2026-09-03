import { Alert } from "@/components/Alert";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { AlertTriangle } from "lucide-react";

import { ReviewRow, SkippedImportItem } from "./interface";

interface Props {
  step: number;
  total: number;
  /** O que a ficha diz: cliente, fábrica, condição, frete. */
  summary?: string;
  reviewRows: ReviewRow[];
  confirmableCount: number;
  skippedItems: SkippedImportItem[];
}

/**
 * O que a ficha diz, antes de virar pedido.
 *
 * Não é a revisão do outro caminho: aqui não há coluna a apontar nem produto a
 * casar na mão — os códigos saíram do catálogo que a própria ficha carrega, e o
 * preço quem dá é o servidor, agora. O que sobra é a conferência de quem sobe o
 * arquivo (às vezes o escritório, não quem vendeu): é este o pedido, é este o
 * cliente, é esta a quantidade de itens.
 *
 * O que não casou aparece com nome e motivo. É o único desencontro possível —
 * produto que saiu de linha depois que a ficha foi baixada — e é melhor
 * descobrir agora do que depois do pedido gravado.
 */
export function StepSheetSummary({
  step,
  total,
  summary,
  reviewRows,
  confirmableCount,
  skippedItems,
}: Props) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={step} total={total} title="Confira a ficha">
        Lemos a planilha inteira. Se estiver tudo certo, confirme abaixo — é
        neste momento que o pedido é criado, com os preços de hoje.
      </Stepper.Intro>

      {summary && (
        <div className="flex flex-col gap-4 rounded-(--r-md) border border-(--border) bg-(--bg2) px-12 py-10">
          <Title variant="caption" color="muted" weight="medium">
            A ficha diz
          </Title>
          <Title variant="body-sm" weight="medium">
            {summary}
          </Title>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-(--r-md) border border-(--border) bg-(--bg2) px-12 py-10">
        <Title variant="caption" color="muted" weight="medium">
          Itens
        </Title>
        <Title variant="body-sm" weight="medium">
          {confirmableCount} de {reviewRows.length} entram no pedido
        </Title>
      </div>

      {skippedItems.length > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={AlertTriangle} />
          <Alert.Content>
            <Alert.Title>{skippedItems.length} item(ns) não entram</Alert.Title>
            <Alert.Description>
              Estes códigos não têm produto ou nível no catálogo desta fábrica —
              o produto pode ter saído de linha depois que a ficha foi baixada:{" "}
              {skippedItems
                .map(
                  (item) => `${item.sku}${item.name ? ` (${item.name})` : ""}`
                )
                .join(", ")}
              .
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
