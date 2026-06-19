import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { ProductDetail } from "../../interface";
import { DeleteProductModal } from "./DeleteProductModal";
import { EditProductModal } from "./EditProductModal";

interface Props {
  product: ProductDetail;
  onRefetch: () => void;
}

export function ProductDetailHeader({ product, onRefetch }: Props) {
  const factory = product.companyFactory?.factory;
  const factoryName = factory
    ? (factory.nomeFantasia ?? factory.razaoSocial)
    : "—";

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item
          href={`/factories/${product.companyFactory?.id}/products`}
        >
          Produtos
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              Produto · {factoryName}
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>{product.name}</PanelHeader.Title>
            <PanelHeader.Description>
              SKU: {product.sku} · Categoria: {product.category?.name ?? "—"} ·
              Unidade base: {product.unit?.label ?? "—"}
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              <Badge.Root
                color={product.isActive ? "green" : "neutral"}
                appearance="tinted"
                size="sm"
              >
                <Badge.Text>
                  {product.isActive ? "Ativo" : "Inativo"}
                </Badge.Text>
              </Badge.Root>
              <EditProductModal product={product} onSuccess={onRefetch} />
              <DeleteProductModal
                productId={product.id}
                productName={product.name}
                productsHref={`/factories/${product.companyFactory?.id}/products`}
              />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
