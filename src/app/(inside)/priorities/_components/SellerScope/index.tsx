"use client";

import { Input, SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { PENDING_SELLERS_QUERY } from "../../gql";
import { PendingSellersResponse } from "../../interface";
import { SELLER_PARAM } from "../../utils";

const EMPTY_INPUT = {};
/**
 * "Toda a empresa" é uma OPÇÃO, e a escolhida por padrão — não um placeholder
 * cinza, que lia como "campo vazio" quando a tela já mostra a empresa toda.
 */
const WHOLE_COMPANY: SelectOption = { value: "", label: "Toda a empresa" };
const getSellers = (d: PendingSellersResponse) => d.pending_sellers;

/**
 * De quem é a carteira lida, no cabeçalho da central: um campo só para as duas
 * abas (17/11/2026). Antes cada aba tinha o seu — em Oportunidades ao lado do
 * aviso, em Pendências escondido no painel de filtros — e trocar de aba
 * esquecia o vendedor escolhido.
 *
 * Mora na URL (`?seller=`), que as duas abas já leem e que as abas da central
 * carregam ao trocar. Escrita pela History API, como os filtros da lista: quem
 * repinta é o Apollo, no cliente, sem ida ao servidor.
 */
export function SellerScope() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get(SELLER_PARAM);

  const sellersQuery = useCompleteList<PendingSellersResponse>(
    PENDING_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers
  );

  const options: SelectOption[] = useMemo(
    () => [
      WHOLE_COMPANY,
      ...(sellersQuery.data?.pending_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    ],
    [sellersQuery.data]
  );

  const onChange = (val: SelectOption | SelectOption[] | null) => {
    const opt = Array.isArray(val) ? val[0] : val;
    const params = new URLSearchParams(searchParams.toString());
    if (opt?.value) params.set(SELLER_PARAM, opt.value);
    else params.delete(SELLER_PARAM);
    // Outro vendedor, outra lista: a página virada não vale mais.
    params.delete("page");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname
    );
  };

  return (
    <div className="desktop:w-[220px] w-full" data-tour="priorities-seller">
      <Input.Select
        size="sm"
        aria-label="Vendedor"
        options={options}
        value={options.find((o) => o.value === sellerId) ?? WHOLE_COMPANY}
        variant="single"
        // Voltar para a empresa é escolher a opção; um X ao lado seria a
        // mesma ação duas vezes.
        disabledClear
        onChange={onChange}
      />
    </div>
  );
}
