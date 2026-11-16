"use client";

import { Input, SelectOption } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { Sparkles } from "lucide-react";

import { OPPORTUNITIES_TAGLINE } from "../../utils";

interface Props {
  canSelectSeller: boolean;
  sellerOptions: SelectOption[];
  sellerId: string | null;
  onSellerChange: (sellerId: string | null) => void;
}

/**
 * A frase da aba Oportunidades e, para o gestor, de quem é a carteira lida.
 * O título e as abas são da central (`pending/layout.tsx`).
 */
export function OpportunitiesHeader({
  canSelectSeller,
  sellerOptions,
  sellerId,
  onSellerChange,
}: Props) {
  return (
    <div className="desktop:flex-row desktop:items-center desktop:justify-between flex flex-col gap-12">
      {/* Mesmo tratamento da aba Pendências: aviso informativo, não texto
          corrido em cinza (14/11/2026). Texto fixo → role="note". */}
      <Alert.Root variant="info" role="note" className="min-w-0 flex-1">
        <Alert.Icon icon={Sparkles} />
        <Alert.Content>
          <Alert.Title>{OPPORTUNITIES_TAGLINE}</Alert.Title>
          <Alert.Description>
            O que é compromisso a resolver (pedido parado, boleto, visita) fica
            na aba Pendências.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      {canSelectSeller && (
        <div
          className="desktop:w-[220px] w-full shrink-0"
          data-tour="opportunities-seller"
        >
          <Input.Select
            size="sm"
            options={sellerOptions}
            value={sellerOptions.find((o) => o.value === sellerId) ?? null}
            variant="single"
            placeholder="Toda a empresa"
            onChange={(val: SelectOption | SelectOption[] | null) => {
              const opt = Array.isArray(val) ? val[0] : val;
              onSellerChange(opt?.value ?? null);
            }}
          />
        </div>
      )}
    </div>
  );
}
