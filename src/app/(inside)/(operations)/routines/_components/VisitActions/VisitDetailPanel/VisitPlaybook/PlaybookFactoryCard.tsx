"use client";
import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { ShoppingBasket } from "lucide-react";
import { PlaybookFactory } from "./interface";
import { PlaybookOfferRow } from "./PlaybookOfferRow";
import { PlaybookPromotion } from "./PlaybookPromotion";

interface Props {
  entry: PlaybookFactory;
  onOpenOrder: (orderId: string) => void;
}

/**
 * O roteiro de UMA fábrica: o pedido que o cliente já fez pelo portal (vem
 * antes de tudo — é venda pronta esperando o vendedor), os produtos a oferecer
 * e a promoção no ar.
 */
export function PlaybookFactoryCard({ entry, onOpenOrder }: Props) {
  const { portalRequest, promotion, offers, moreOffersCount } = entry;

  return (
    <Card.Root inset tone="transparent">
      <Card.Body padding="sm" className="gap-10">
        <div className="flex items-start justify-between gap-8">
          <Title
            variant="body-sm"
            weight="semibold"
            className="min-w-0 truncate"
          >
            {factoryName(entry.factory)}
          </Title>
          {entry.isFocus && (
            <Badge.Root
              color="neutral"
              appearance="tinted"
              size="xs"
              title="Esta fábrica é um dos motivos da visita."
            >
              <Badge.Text>Motivo da visita</Badge.Text>
            </Badge.Root>
          )}
        </div>

        {portalRequest && (
          <Alert.Root variant="info" size="sm">
            <Alert.Content>
              <Alert.Description>
                O cliente pediu reposição pelo portal em{" "}
                {formatDate(portalRequest.requestedOn)}. Confira o orçamento.
              </Alert.Description>
            </Alert.Content>
            <Alert.Actions>
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                noUppercase
                onClick={() => onOpenOrder(portalRequest.orderId)}
              >
                <Button.Icon icon={ShoppingBasket} />
                <Button.Title>Ver pedido</Button.Title>
              </Button.Root>
            </Alert.Actions>
          </Alert.Root>
        )}

        {offers.map((offer) => (
          <PlaybookOfferRow key={offer.productId} offer={offer} />
        ))}
        {moreOffersCount > 0 && (
          <Title variant="body-xs" color="muted">
            E mais {moreOffersCount} produto{moreOffersCount > 1 ? "s" : ""}{" "}
            para oferecer nesta fábrica.
          </Title>
        )}

        {promotion && <PlaybookPromotion promotion={promotion} />}
      </Card.Body>
    </Card.Root>
  );
}
