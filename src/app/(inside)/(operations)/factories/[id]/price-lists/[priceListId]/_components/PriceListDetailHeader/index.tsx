"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { formatDateDMY } from "@/utils/format/masks";
import { CompanyFactoryDetail } from "../../../../interface";
import { PriceListDetail } from "../../interface";
import { DeletePriceListModal } from "./DeletePriceListModal";
import { EditPriceListModal } from "./EditPriceListModal";

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
  const factory = companyFactory.factory;
  const factoryName = factory.nomeFantasia ?? factory.razaoSocial;
  const basePath = `/factories/${companyFactory.id}`;

  const validity = priceList
    ? `${formatDateDMY(priceList.validFrom)} → ${
        priceList.validUntil ? formatDateDMY(priceList.validUntil) : "indeterminada"
      }`
    : "—";

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
            <PanelHeader.Eyebrow>
              Tabela de preços · {factoryName}
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>
              {loading && !priceList ? "Carregando…" : priceList?.name}
            </PanelHeader.Title>
            <PanelHeader.Description>
              Vigência: {validity}
            </PanelHeader.Description>
            {priceList && (
              <PanelHeader.Actions className="mt-6">
                <Badge.Root
                  color={priceList.isActive ? "green" : "neutral"}
                  appearance="tinted"
                  size="sm"
                >
                  <Badge.Text>
                    {priceList.isActive ? "Ativa" : "Inativa"}
                  </Badge.Text>
                </Badge.Root>
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
