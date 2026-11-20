"use client";
import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import {
  PURCHASE_STATUS_COLOR,
  PURCHASE_STATUS_HINT,
  PURCHASE_STATUS_LABEL,
} from "@/utils/productPurchase";
import { Zap } from "lucide-react";
import { PlaybookOffer } from "./interface";
import { offerDetail } from "./utils";

/**
 * Um produto para puxar o assunto: o nome, a situação ("Hora de repor") com a
 * explicação no `title`, e quanto ele levou da última vez — a quantidade que o
 * vendedor sugere sem abrir o histórico.
 */
export function PlaybookOfferRow({ offer }: { offer: PlaybookOffer }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <Badge.Root
          color={PURCHASE_STATUS_COLOR[offer.status]}
          appearance="tinted"
          size="xs"
          title={PURCHASE_STATUS_HINT[offer.status]}
        >
          <Badge.Text>{PURCHASE_STATUS_LABEL[offer.status]}</Badge.Text>
        </Badge.Root>
        {offer.isPromo && (
          <Badge.Root
            color="orange"
            appearance="tinted"
            size="xs"
            title="Este produto está em promoção relâmpago hoje nesta fábrica."
          >
            <Badge.Icon>
              <Zap />
            </Badge.Icon>
            <Badge.Text>Promoção</Badge.Text>
          </Badge.Root>
        )}
      </div>
      <Title variant="body-sm">{offer.product?.name ?? "Produto"}</Title>
      <Title variant="body-xs" color="muted">
        {offerDetail(offer)}
      </Title>
    </div>
  );
}
