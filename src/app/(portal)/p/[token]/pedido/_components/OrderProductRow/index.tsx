import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { ProductThumb } from "@/components/ProductThumb";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Check, Package, Plus } from "lucide-react";
import { ReactNode } from "react";
import { formatUnits } from "../../../utils";
import { OrderableProduct } from "../../interface";
import { minimumPackText, multipleOf, packPriceText } from "../../utils";
import { ProductPrice } from "../ProductPrice";

interface OrderProductRowProps {
  item: OrderableProduct & { pendingQuantity: string | null };
  /** O que já está na lista do cliente. */
  inCart: boolean;
  onAdd: (item: OrderableProduct) => void;
  onRemove: (productId: string) => void;
  /** Célula de situação, quando a tabela tem essa coluna. */
  status?: { label: string; content: ReactNode };
}

/**
 * Uma linha da tabela de produtos: quem é o produto, a embalagem mínima, o
 * preço da unidade e um botão só, que diz em palavras o que faz.
 *
 * A quantidade NÃO fica aqui: o produto entra na lista com uma embalagem (ou
 * a última compra) e o cliente ajusta lá, vendo tudo o que escolheu junto.
 */
export function OrderProductRow({
  item,
  inCart,
  onAdd,
  onRemove,
  status,
}: OrderProductRowProps) {
  const isLoose = (multipleOf(item.saleMultiple) ?? 1) === 1;
  const packPrice = packPriceText(item.saleMultiple, item.estimatedUnitPrice);

  return (
    <Table.Row>
      <Table.Cell card="title" wrap>
        <div className="flex min-w-0 items-center gap-12">
          <ProductThumb
            imageUrl={item.imageUrl ?? null}
            name={item.productName}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <Title variant="body-sm" weight="semibold" className="break-words">
              {item.productName}
            </Title>
            {item.sku ? (
              <Title variant="body-xs" color="muted">
                Código {item.sku}
              </Title>
            ) : null}
            {item.pendingQuantity ? (
              <Title variant="body-xs" color="muted">
                Já pedido: {formatUnits(item.pendingQuantity)} unidades,
                esperando o representante confirmar.
              </Title>
            ) : null}
          </div>
        </div>
      </Table.Cell>

      {status ? (
        <Table.Cell card="status" label={status.label}>
          {status.content}
        </Table.Cell>
      ) : null}

      <Table.Cell label="Embalagem mínima" wrap>
        <div className="flex flex-col items-start gap-4">
          <Badge.Root color={isLoose ? "neutral" : "amber"} size="sm">
            <Badge.Icon>
              <Package />
            </Badge.Icon>
            <Badge.Text>
              {isLoose ? "Avulso" : minimumPackText(item.saleMultiple)}
            </Badge.Text>
          </Badge.Root>
          {packPrice ? (
            <Title
              variant="body-xs"
              color="muted"
              className="whitespace-nowrap"
            >
              {packPrice}
            </Title>
          ) : isLoose ? (
            <Title variant="body-xs" color="muted">
              Vendido por unidade
            </Title>
          ) : null}
        </div>
      </Table.Cell>

      <Table.Cell card="value" align="right">
        <ProductPrice
          estimatedUnitPrice={item.estimatedUnitPrice}
          estimatedUnitPriceWithTax={item.estimatedUnitPriceWithTax}
          isPromo={item.isPromo}
          lastUnitPrice={item.lastUnitPrice}
        />
      </Table.Cell>

      <Table.Cell card="actions" align="right">
        {inCart ? (
          <Button.Root
            type="button"
            appearance="tinted"
            color="green"
            size="md"
            aria-pressed
            aria-label={`${item.productName} está na lista. Tocar para tirar.`}
            onClick={() => onRemove(item.productId)}
            className="desktop:w-auto w-full"
          >
            <Button.Icon icon={Check} />
            <Button.Title>Na lista</Button.Title>
          </Button.Root>
        ) : (
          <Button.Root
            type="button"
            appearance="outline"
            color="amber"
            size="md"
            aria-pressed={false}
            aria-label={`Adicionar ${item.productName} à lista`}
            onClick={() => onAdd(item)}
            className="desktop:w-auto w-full"
          >
            <Button.Icon icon={Plus} />
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
