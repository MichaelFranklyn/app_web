"use client";

import { Input, SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";

import { OPPORTUNITIES_TAGLINE } from "../../utils";

interface Props {
  canSelectSeller: boolean;
  sellerOptions: SelectOption[];
  sellerId: string | null;
  onSellerChange: (sellerId: string | null) => void;
}

export function OpportunitiesHeader({
  canSelectSeller,
  sellerOptions,
  sellerId,
  onSellerChange,
}: Props) {
  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          {/* Eyebrow verde: oportunidade é assunto de carteira (Clientes). */}
          <PanelHeader.Eyebrow className="text-(--green)">
            Clientes
          </PanelHeader.Eyebrow>
          <PanelHeader.Title>Oportunidades</PanelHeader.Title>
          <PanelHeader.Description>
            {OPPORTUNITIES_TAGLINE} O que é compromisso a resolver — pedido
            parado, boleto, visita — fica em Pendências.
          </PanelHeader.Description>
          {canSelectSeller && (
            <PanelHeader.Actions
              className="mt-6"
              data-tour="opportunities-seller"
            >
              <div className="desktop:w-[220px] w-full">
                <Input.Select
                  size="sm"
                  options={sellerOptions}
                  value={
                    sellerOptions.find((o) => o.value === sellerId) ?? null
                  }
                  variant="single"
                  placeholder="Toda a empresa"
                  onChange={(val: SelectOption | SelectOption[] | null) => {
                    const opt = Array.isArray(val) ? val[0] : val;
                    onSellerChange(opt?.value ?? null);
                  }}
                />
              </div>
            </PanelHeader.Actions>
          )}
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
