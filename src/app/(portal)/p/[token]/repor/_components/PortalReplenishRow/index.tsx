import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { PortalReplenishmentItem } from "../../../interface";
import { stockUrgency } from "../../../utils";
import { formatUnits } from "../../utils";

interface PortalReplenishRowProps {
  item: PortalReplenishmentItem;
}

/**
 * Um produto acabando: marcar e, se quiser, mudar a quantidade.
 *
 * A quantidade já vem com o que ele levou da última vez, e o "Pedir" começa
 * DESMARCADO. É o marcar que envia — sem isso, um toque em "Pedir reposição"
 * pediria a lista inteira com números que o cliente não conferiu (mesmo
 * cuidado do campo vazio da tela de estoque).
 *
 * O que já foi pedido e espera o representante aparece na linha: sem isso, o
 * cliente que não viu nada acontecer pede de novo.
 */
export function PortalReplenishRow({ item }: PortalReplenishRowProps) {
  const urgency = stockUrgency(item.daysRemaining);
  const multiple = item.saleMultiple ? Number(item.saleMultiple) : null;

  return (
    <Card.Root>
      <Card.Body padding="compact">
        <div className="flex h-full flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <Title variant="body-sm" weight="semibold" className="break-words">
              {item.productName}
            </Title>
            <Title variant="body-xs" color="muted">
              {item.factoryName}
            </Title>
            {item.lastPurchaseDate ? (
              <Title variant="body-xs" color="muted">
                Última compra em {formatDate(item.lastPurchaseDate)}
              </Title>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-[8px]">
            <Badge color={urgency.tone} size="xs">
              <Badge.Text>{urgency.label}</Badge.Text>
            </Badge>

            {item.pendingQuantity ? (
              <Title variant="body-xs" color="muted">
                Já pedido: {formatUnits(item.pendingQuantity)} unidades,
                esperando o representante confirmar.
              </Title>
            ) : null}

            <Input.Number
              id={`qty__${item.productId}`}
              name={`qty__${item.productId}`}
              label="Quantas unidades?"
              placeholder="Ex: 12"
              size="lg"
              inputMode="decimal"
              min={0}
              step={multiple ?? undefined}
              defaultValue={Number(item.suggestedQuantity)}
              hint={
                multiple && multiple > 1
                  ? `A fábrica vende de ${formatUnits(item.saleMultiple)} em ${formatUnits(item.saleMultiple)}.`
                  : undefined
              }
            />

            <Input.Checkbox
              id={`pick__${item.productId}`}
              name={`pick__${item.productId}`}
              label="Pedir este produto"
            />
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
