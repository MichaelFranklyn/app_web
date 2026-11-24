import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { ProductDetail } from "../../interface";
import { DeleteProductModal } from "./DeleteProductModal";
import { EditProductModal } from "./EditProductModal";

interface Props {
  product: ProductDetail;
  onRefetch: () => void;
}

export function ProductDetailHeader({ product, onRefetch }: Props) {
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
            <PanelHeader.Heading {...PAGE_HEADING.product}>
              {product.name}
            </PanelHeader.Heading>
            <PanelHeader.Description>
              Código: {product.sku} · Categoria: {product.category?.name ?? "—"}{" "}
              · Unidade base: {product.unit?.label ?? "—"}
            </PanelHeader.Description>
            {/* Tarja na faixa, ações depois dela (padrão de cabeçalho). */}
            <PanelHeader.Tags>
              <Badge.Root
                color={product.isActive ? "green" : "neutral"}
                appearance="tinted"
                size="sm"
              >
                <Badge.Text>
                  {product.isActive ? "Ativo" : "Inativo"}
                </Badge.Text>
              </Badge.Root>
              <PanelHeader.Actions>
                <EditProductModal product={product} onSuccess={onRefetch} />
                <DeleteProductModal
                  productId={product.id}
                  productName={product.name}
                  productsHref={`/factories/${product.companyFactory?.id}/products`}
                />
              </PanelHeader.Actions>
            </PanelHeader.Tags>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
