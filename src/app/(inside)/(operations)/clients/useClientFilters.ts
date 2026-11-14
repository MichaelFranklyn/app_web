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
 * A busca por nome NÃO aparece no painel: ela mora à vista no cabeçalho da
 * tabela (ClientsTable), porque é por onde quase sempre se começa. Fica aqui
 * como campo escondido para o aviso dos KPIs (KPI_IGNORED_FILTERS) dizer
 * "Busca" pelo nome — e, por ser escondida, não conta no "Filtros (n)" nem é
 * apagada pelo "Limpar filtros", que só mexem no que o painel mostra.
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
        placeholder: "Nome, razão social ou CNPJ",
        hidden: true,
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
        key: "walletStatus",
        label: "Situação",
        placeholder: "Só os ativos",
        options: [
          { value: "INACTIVE", label: "Fora da carteira (encerrados)" },
          { value: "ALL", label: "Todos" },
        ],
        // Quem saiu da carteira (não existe mais, não trabalham mais, mudou
        // de CNPJ) não aparece por padrão: não recebe visita nem pedido. O
        // filtro existe para achá-lo e, se for o caso, reativar.
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
