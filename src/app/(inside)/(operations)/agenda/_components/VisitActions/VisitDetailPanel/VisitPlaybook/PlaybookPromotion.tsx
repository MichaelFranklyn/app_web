"use client";
import { Badge } from "@/components/Badges";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { toIsoDate } from "@/utils/format/date";
import { Zap } from "lucide-react";
import { PlaybookPromotion as Promotion } from "./interface";
import { promoEndsLabel } from "./utils";

/**
 * A promoção relâmpago da fábrica, vista por este cliente: o prazo (é o
 * argumento de fechar hoje), o desconto no nível dele e os produtos que ele já
 * compra primeiro. O preço não aparece: o preço é por embalagem e o pedido por
 * unidade, e o desconto em % diz o que importa sem essa conta.
 */
export function PlaybookPromotion({ promotion }: { promotion: Promotion }) {
  const hidden = promotion.productCount - promotion.products.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <Badge.Root color="orange" appearance="tinted" size="xs">
          <Badge.Icon>
            <Zap />
          </Badge.Icon>
          <Badge.Text>Promoção relâmpago</Badge.Text>
        </Badge.Root>
        <Title variant="body-xs" color="orange">
          {promoEndsLabel(promotion.endsOn, toIsoDate(new Date()))}
        </Title>
      </div>
      {promotion.products.map((item) => (
        <Title key={item.productId} variant="body-xs" color="secondary">
          <Emphasis>{item.discountPercent}% mais barato</Emphasis> —{" "}
          {item.product?.name ?? "Produto"}
          {item.isBoughtByClient ? " (ele já compra)" : ""}
        </Title>
      ))}
      {hidden > 0 && (
        <Title variant="body-xs" color="muted">
          E mais {hidden} produto{hidden > 1 ? "s" : ""} em promoção nesta
          fábrica.
        </Title>
      )}
    </div>
  );
}
