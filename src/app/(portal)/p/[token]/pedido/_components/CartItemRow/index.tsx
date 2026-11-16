import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ProductThumb } from "@/components/ProductThumb";
import { Title } from "@/components/Title";
import { Minus, Plus, Trash2 } from "lucide-react";
import { OrderCartItem } from "../../interface";
import {
  formatQuantity,
  isAtMinimumPack,
  lastPriceText,
  lineEstimateText,
  minimumPackText,
  multipleOf,
  packCountText,
  stepQuantity,
} from "../../utils";

/** Teclas que o campo numérico aceitaria mas que não são quantidade. */
const BLOCKED_KEYS = new Set(["e", "E", "+", "-"]);

interface CartItemRowProps {
  item: OrderCartItem;
  /** Motivo de a quantidade não valer — só depois de tocar ou tentar enviar. */
  error: string | null;
  onQuantity: (productId: string, quantity: string) => void;
  onBlur: (item: OrderCartItem) => void;
  onRemove: (productId: string) => void;
}

/**
 * Um produto da lista: quantas unidades, de embalagem em embalagem.
 *
 * O "−" e o "+" andam uma embalagem mínima por vez — quem compra caixa de 12
 * não precisa fazer conta. O campo continua digitável para quem prefere.
 */
export function CartItemRow({
  item,
  error,
  onQuantity,
  onBlur,
  onRemove,
}: CartItemRowProps) {
  const multiple = multipleOf(item.saleMultiple);
  const fieldId = `qty__${item.productId}`;
  const hint = error ?? packCountText(item);
  const estimate = lineEstimateText(item);
  const lastPrice = lastPriceText(item.lastUnitPrice);
  const step = (direction: 1 | -1) =>
    onQuantity(
      item.productId,
      stepQuantity(item.quantity, item.saleMultiple, direction)
    );

  return (
    <Card.Row className="flex-col items-stretch gap-[12px]">
      <input type="hidden" name={`pick__${item.productId}`} value="on" />

      <div className="flex items-start gap-[12px]">
        <ProductThumb
          imageUrl={item.imageUrl ?? null}
          name={item.productName}
          size="sm"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <Title variant="body-sm" weight="semibold" className="break-words">
            {item.productName}
          </Title>
          <Title variant="body-xs" color="muted">
            Embalagem mínima: {minimumPackText(item.saleMultiple)}
          </Title>
        </div>
        <Button.Root
          type="button"
          appearance="ghost"
          color="red"
          size="sm"
          isIconOnly
          aria-label={`Tirar ${item.productName} da lista`}
          title="Tirar da lista"
          onClick={() => onRemove(item.productId)}
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </div>

      <Input.Root id={fieldId} error={Boolean(error)} required>
        <Input.Label>Quantas unidades?</Input.Label>
        {/* Stepper de largura fixa: o campo esticado na largura toda do
            cartão parecia um formulário, não uma quantidade. */}
        <div className="flex items-center gap-[8px]">
          <Button.Root
            type="button"
            appearance="outline"
            color="neutral"
            isIconOnly
            aria-label={`Uma embalagem a menos de ${item.productName}`}
            disabled={isAtMinimumPack(item.quantity, item.saleMultiple)}
            onClick={() => step(-1)}
          >
            <Button.Icon icon={Minus} />
          </Button.Root>
          <Input.Control
            name={fieldId}
            type="number"
            inputMode="decimal"
            placeholder={`Ex: ${formatQuantity(multiple ?? 1)}`}
            min={multiple ?? 0}
            step={multiple ?? undefined}
            value={item.quantity}
            onChange={(event) => onQuantity(item.productId, event.target.value)}
            onKeyDown={(event) => {
              if (BLOCKED_KEYS.has(event.key)) event.preventDefault();
            }}
            onBlur={() => onBlur(item)}
            className="w-[80px] text-center"
          />
          <Button.Root
            type="button"
            appearance="outline"
            color="neutral"
            isIconOnly
            aria-label={`Uma embalagem a mais de ${item.productName}`}
            onClick={() => step(1)}
          >
            <Button.Icon icon={Plus} />
          </Button.Root>
        </div>
        {hint ? <Input.Hint>{hint}</Input.Hint> : null}
      </Input.Root>

      {estimate || lastPrice ? (
        <div className="flex flex-col gap-[2px]">
          {estimate ? (
            <Title variant="body-sm" color="muted">
              {estimate}
            </Title>
          ) : null}
          {lastPrice ? (
            <Title variant="body-xs" color="muted">
              {lastPrice}
            </Title>
          ) : null}
        </div>
      ) : null}
    </Card.Row>
  );
}
