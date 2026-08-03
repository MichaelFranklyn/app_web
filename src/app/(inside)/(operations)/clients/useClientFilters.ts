"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { useMemo } from "react";
import { STATE_OPTIONS } from "./utils";

interface Params {
  /** Só gestor escolhe o vendedor — o vendedor logado já vê a própria carteira. */
  canFilterBySeller: boolean;
  /** Vendedores da empresa (vêm de useSellerScope). */
  sellerOptions: SelectOption[];
  sellersLoading: boolean;
  /** Redes e segmentos cadastrados (vêm de useClassificationOptions). */
  networkOptions: SelectOption[];
  segmentOptions: SelectOption[];
  classificationLoading: boolean;
}

/**
 * Monta os campos do painel de filtros da carteira de clientes.
 *
 * O mesmo painel dos pedidos, com o recorte que a carteira pede: qual empresa,
 * de quem é o cliente, onde ele fica e se o cadastro está pendente de revisão.
 *
 * A busca por nome abre a lista porque é por onde quase sempre se começa —
 * e, estando aqui, "Limpar filtros" a apaga junto com o resto, em vez de
 * deixar um texto valendo fora do painel sem ninguém ver.
 */
export function useClientFilters({
  canFilterBySeller,
  sellerOptions,
  sellersLoading,
  networkOptions,
  segmentOptions,
  classificationLoading,
}: Params): FilterField[] {
  return useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Buscar",
        placeholder: "Razão social ou nome fantasia",
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellerOptions,
        loading: sellersLoading,
        hidden: !canFilterBySeller,
      },
      {
        type: "select",
        key: "networkId",
        label: "Rede",
        placeholder: "Todas as redes",
        options: networkOptions,
        loading: classificationLoading,
        // Empresa que não usa redes não precisa ver o campo ocupando espaço.
        hidden: networkOptions.length === 0,
      },
      {
        type: "select",
        key: "segmentId",
        label: "Segmento",
        placeholder: "Todos os segmentos",
        options: segmentOptions,
        loading: classificationLoading,
        hidden: segmentOptions.length === 0,
      },
      {
        type: "select",
        key: "state",
        label: "Estado",
        placeholder: "Todos os estados",
        options: STATE_OPTIONS,
      },
      {
        type: "select",
        key: "needsAttention",
        label: "Cadastro",
        placeholder: "Todos os cadastros",
        options: [
          { value: "true", label: "Precisa de atenção" },
          { value: "false", label: "Sem pendência" },
        ],
      },
    ],
    [
      canFilterBySeller,
      sellerOptions,
      sellersLoading,
      networkOptions,
      segmentOptions,
      classificationLoading,
    ]
  );
}
