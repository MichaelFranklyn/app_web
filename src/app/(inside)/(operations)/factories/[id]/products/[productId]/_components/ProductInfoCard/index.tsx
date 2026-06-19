import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { formatNumber } from "@/utils/format/masks";
import { ProductDetail } from "../../interface";

interface Props {
  product: ProductDetail;
}

export function ProductInfoCard({ product }: Props) {
  return (
    <div className="flex flex-col gap-12">
      <Card.Root>
        <Card.Header>
          <Card.Header.Title size="sm" weight="bold">
            <span className="inline-flex items-center gap-6">
              Informações
              <HelpTooltip
                label="O que significa cada campo?"
                content={
                  <div className="flex flex-col gap-2">
                    <Title variant="label" color="amber">
                      Campos do produto
                    </Title>
                    <Title variant="body-sm">
                      <b>Embalagem</b>: quantas unidades vêm na embalagem
                      fechada (ex.: caixa com 12). <b>NCM</b>: código fiscal
                      usado na nota. <b>Múltiplo de venda</b>: a fábrica só
                      aceita quantidades múltiplas desse número — &quot;Livre&quot;
                      significa qualquer quantidade.
                    </Title>
                    <Title variant="body-sm" color="muted">
                      Para alterar esses dados, use o botão Editar no topo da
                      página.
                    </Title>
                  </div>
                }
              />
            </span>
          </Card.Header.Title>
        </Card.Header>
        <Card.Body padding="compact">
          <Card.Item variant="stat">
            <Card.Item.Label>SKU</Card.Item.Label>
            <Card.Item.Value>{product.sku}</Card.Item.Value>
          </Card.Item>
          <Card.Item variant="stat">
            <Card.Item.Label>Unidade base</Card.Item.Label>
            <Card.Item.Value>{product.unit?.label ?? "—"}</Card.Item.Value>
          </Card.Item>
          <Card.Item variant="stat">
            <Card.Item.Label>Embalagem</Card.Item.Label>
            <Card.Item.Value>
              {formatNumber(Number(product.unitPerPack))}{" "}
              {product.unitLabel?.label ?? ""}
            </Card.Item.Value>
          </Card.Item>

          <Card.Item variant="stat">
            <Card.Item.Label>NCM</Card.Item.Label>
            <Card.Item.Value>{product.ncm ?? "—"}</Card.Item.Value>
          </Card.Item>

          <Card.Item variant="stat">
            <Card.Item.Label>Múltiplo de venda</Card.Item.Label>
            <Card.Item.Value>
              {product.saleMultiple
                ? `${formatNumber(Number(product.saleMultiple))} embalagem(ns)`
                : "Livre"}
            </Card.Item.Value>
          </Card.Item>

          <Card.Item variant="stat">
            <Card.Item.Label>Status</Card.Item.Label>
            <Card.Item.Value color={product.isActive ? "green" : undefined}>
              {product.isActive ? "Ativo" : "Inativo"}
            </Card.Item.Value>
          </Card.Item>

          {product.category && (
            <Card.Item variant="stat">
              <Card.Item.Label>Categoria</Card.Item.Label>
              <Card.Item.Value>{product.category.name}</Card.Item.Value>
            </Card.Item>
          )}

          {product.category && (
            <Card.Item variant="stat" bordered={false}>
              <Card.Item.Label>Segmento</Card.Item.Label>
              <Card.Item.Value>{product.category.segment}</Card.Item.Value>
            </Card.Item>
          )}
        </Card.Body>
      </Card.Root>
    </div>
  );
}
