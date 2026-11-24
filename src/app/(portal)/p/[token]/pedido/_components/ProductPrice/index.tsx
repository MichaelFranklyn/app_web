import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { lastPriceText, priceWithTaxText } from "../../utils";

interface ProductPriceProps {
  estimatedUnitPrice?: string | null;
  estimatedUnitPriceWithTax?: string | null;
  isPromo?: boolean;
  lastUnitPrice?: string | null;
}

/**
 * O preço de um produto na tela do pedido: o estimado pela tabela do cliente,
 * em destaque, o mesmo preço com os impostos do produto (é o que pesa no
 * total) e logo abaixo quanto ele pagou na última compra — para
 * comparar sem fazer conta de cabeça. Sem preço na tabela, diz quem informa.
 */
export function ProductPrice({
  estimatedUnitPrice,
  estimatedUnitPriceWithTax,
  isPromo = false,
  lastUnitPrice,
}: ProductPriceProps) {
  const last = lastPriceText(lastUnitPrice);
  const withTax = priceWithTaxText(
    estimatedUnitPrice,
    estimatedUnitPriceWithTax
  );

  return (
    <div className="desktop:items-end flex shrink-0 flex-col items-start gap-4">
      {estimatedUnitPrice ? (
        <div className="flex items-center gap-6">
          <Title variant="heading-sm">
            {formatMoney(estimatedUnitPrice)} / un.
          </Title>
          {isPromo ? (
            <Badge.Root color="green" size="xs">
              <Badge.Text>Promoção</Badge.Text>
            </Badge.Root>
          ) : null}
        </div>
      ) : (
        <Title variant="body-xs" color="muted">
          Preço com o representante
        </Title>
      )}
      {withTax ? (
        <Title variant="body-xs" color="muted">
          {withTax}
        </Title>
      ) : null}
      {last ? (
        <Title variant="body-xs" color="muted">
          {last}
        </Title>
      ) : null}
    </div>
  );
}
