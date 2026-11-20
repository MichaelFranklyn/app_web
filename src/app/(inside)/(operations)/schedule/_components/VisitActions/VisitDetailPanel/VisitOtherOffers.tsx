"use client";
import { Badge } from "@/components/Badges";
import { BulletList } from "@/components/BulletList";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";

import { OtherOfficeOffer } from "../../../utils";
import { FactoryScoreHint } from "../../FactoryScoreHint";

interface Props {
  offers: OtherOfficeOffer[];
}

/**
 * "Ofereça também" — as fábricas que o cliente compra de você por OUTRO
 * escritório, uma por linha. A ida é uma só, então dá para oferecer todas.
 * Cada linha traz o score de lá (o selo abre o tooltip com o motivo da
 * visita); nada de comissão, percentual ou preço de outro escritório.
 */
export function VisitOtherOffers({ offers }: Props) {
  const { name: currentOffice } = useCompanyBranding();
  if (offers.length === 0) return null;

  // A ajuda abre no toque (HelpTooltip): é o que o vendedor lê no celular,
  // antes de entrar no cliente.
  const help = (
    <Title variant="body-sm" color="inherit">
      O cliente também compra estas fábricas de você por outro escritório. Na
      mesma ida, dá para oferecer todas. O pedido e o estoque delas ficam no
      escritório de cada uma: o &quot;Ver cliente&quot; abre a ficha
      {currentOffice ? ` no ${currentOffice}` : " neste escritório"}. Para pedir
      delas, troque de escritório. O número é o score da fábrica lá.
    </Title>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <Title variant="micro" color="muted">
          Ofereça também
        </Title>
        <HelpTooltip label="O que é esta lista?" content={help} />
      </div>

      <BulletList.Root className="gap-6">
        {offers.map(({ key, factoryName, officeName, chip }) => (
          <BulletList.Item key={key}>
            <div className="flex items-start justify-between gap-8">
              <div className="flex min-w-0 flex-col">
                <Title variant="body-sm" className="break-words">
                  {factoryName}
                </Title>
                <Title variant="micro" color="muted" className="break-words">
                  {officeName}
                </Title>
              </div>
              {chip && (
                <FactoryScoreHint chips={[chip]}>
                  <Badge.Root
                    color={chip.level.tone}
                    appearance="tinted"
                    className="shrink-0 cursor-help"
                  >
                    <Badge.Dot />
                    <Badge.Text>
                      {chip.level.label} · {chip.score}
                    </Badge.Text>
                  </Badge.Root>
                </FactoryScoreHint>
              )}
            </div>
          </BulletList.Item>
        ))}
      </BulletList.Root>
    </div>
  );
}
