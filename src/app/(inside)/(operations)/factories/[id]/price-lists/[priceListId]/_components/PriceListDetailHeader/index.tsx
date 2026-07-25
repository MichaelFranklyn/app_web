"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { formatDateDMY } from "@/utils/format/masks";
import { Zap } from "lucide-react";
import { CompanyFactoryDetail } from "../../../../interface";
import { PriceListDetail } from "../../interface";
import { DeletePriceListModal } from "./DeletePriceListModal";
import { EditPriceListModal } from "./EditPriceListModal";
import { PromotionModal } from "./PromotionModal";

interface Props {
  priceList: PriceListDetail | null | undefined;
  loading: boolean;
  companyFactory: CompanyFactoryDetail;
  onRefetch: () => void;
}

export function PriceListDetailHeader({
  priceList,
  loading,
  companyFactory,
  onRefetch,
}: Props) {
  const basePath = `/factories/${companyFactory.id}`;

  const validity = priceList
    ? `${formatDateDMY(priceList.validFrom)} → ${
        priceList.validUntil
          ? formatDateDMY(priceList.validUntil)
          : "indeterminada"
      }`
    : "—";

  const promoWindow =
    priceList?.promoStartsOn && priceList?.promoEndsOn
      ? `${formatDateDMY(priceList.promoStartsOn)} → ${formatDateDMY(
          priceList.promoEndsOn
        )}`
      : null;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item href={`${basePath}/price-lists`}>
          Preços
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          {loading && !priceList ? "Carregando…" : (priceList?.name ?? "—")}
        </Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>
              {loading && !priceList ? "Carregando…" : priceList?.name}
            </PanelHeader.Title>
            <PanelHeader.Description>
              Vigência: {validity}
              {promoWindow && (
                <>
                  {" · "}
                  <span className="text-(--orange)">
                    Promoção relâmpago: {promoWindow}
                  </span>
                </>
              )}
            </PanelHeader.Description>
            {priceList && (
              <PanelHeader.Actions
                className="mt-6"
                data-tour="price-detail-actions"
              >
                <Badge.Root
                  color={priceList.isActive ? "green" : "neutral"}
                  appearance="tinted"
                  size="sm"
                >
                  <Badge.Text>
                    {priceList.isActive ? "Ativa" : "Inativa"}
                  </Badge.Text>
                </Badge.Root>
                {priceList.isPromoActive && (
                  <Badge.Root color="orange" appearance="tinted" size="sm">
                    <Badge.Icon>
                      <Zap />
                    </Badge.Icon>
                    <Badge.Text>Promoção no ar</Badge.Text>
                  </Badge.Root>
                )}
                <PromotionModal priceList={priceList} onChanged={onRefetch} />
                <EditPriceListModal
                  priceList={priceList}
                  onChanged={onRefetch}
                />
                <DeletePriceListModal
                  priceListId={priceList.id}
                  priceListName={priceList.name}
                  priceListsHref={`${basePath}/price-lists`}
                />
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
