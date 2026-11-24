"use client";

import { useApolloClient } from "@apollo/client/react";

import { FilterField } from "@/components/Filters";
import { useToast } from "@/components/Toast";
import { isTruncated, MAX_SCAN_PAGES } from "@/utils/pagination";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { downloadSheet } from "@/utils/import/writer";
import type { QueryFilter } from "@/hooks/useTableData";
import { ReportOrder } from "@/utils/pdf/context";

import { ORDERS_QUERY } from "../../gql";
import { Order, QueryData } from "../../interface";
import { exportOrdersPdf } from "../../pdf";
import { EXPORT_HEADERS, buildExportRows } from "./ExportOrdersButton/utils";

export interface ExportOrdersOptions {
  /** O MESMO recorte da tabela: filtros do painel + o da aba corrente. */
  filters: QueryFilter[];
  /** Campos do painel, para o PDF escrever o recorte por extenso. */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  /** Ordenação à vista na tabela; o arquivo sai na MESMA ordem. */
  order?: ReportOrder | null;
  /** Aba corrente, quando ela restringe a lista ("Esperando faturamento"). */
  scopeLabel?: string | null;
}

/** Página do backend na varredura. O teto de páginas é o do app inteiro
 * (`MAX_SCAN_PAGES`), para a mesma lista não sair completa aqui e cortada na
 * tela vizinha. */
const PAGE_SIZE = 100;

/**
 * Baixa os pedidos do recorte à vista em planilha (.xlsx) — para somar e cruzar
 * com a fábrica — ou em PDF — para imprimir e levar para a reunião.
 *
 * A tela pagina de 15 em 15, então exportar o que está em memória daria um
 * arquivo de quinze linhas. Aqui a query é refeita sob demanda, varrendo todas
 * as páginas com os mesmos filtros E a mesma ordenação que o usuário aplicou —
 * exportar é levar embora a lista que está à vista, não outra parecida.
 */
export function useExportOrders({
  filters,
  filterFields,
  inputValues,
  order,
  scopeLabel,
}: ExportOrdersOptions) {
  const apollo = useApolloClient();
  const { toast } = useToast();
  // Logo e nome da representação no cabeçalho do documento impresso.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  /** A lista inteira do recorte e se a varredura parou no teto de páginas. */
  const fetchAllOrders = async (): Promise<{
    all: Order[];
    truncated: boolean;
  }> => {
    const all: Order[] = [];
    let after: string | null = null;
    let pagesRead = 0;
    let hasMore = false;

    for (let page = 0; page < MAX_SCAN_PAGES; page++) {
      const result: { data?: QueryData } = await apollo.query<QueryData>({
        query: ORDERS_QUERY,
        variables: {
          input: {
            first: PAGE_SIZE,
            after,
            ...(filters.length > 0 && { filters }),
            ...(order && { order }),
          },
        },
        fetchPolicy: "network-only",
      });

      const connection = result.data?.orders_list;
      if (!connection) break;
      all.push(...connection.edges.map((edge) => edge.node));
      pagesRead += 1;

      const { hasNextPage, endCursor } = connection.pageInfo ?? {};
      hasMore = Boolean(hasNextPage && endCursor);
      if (!hasMore) break;
      after = endCursor!;
    }

    return { all, truncated: isTruncated(pagesRead, hasMore) };
  };

  /** Varre a lista e entrega ao formato pedido; nada baixa se vier vazia. */
  const runExport = async (write: (orders: Order[]) => Promise<void>) => {
    try {
      const { all: orders, truncated } = await fetchAllOrders();
      if (orders.length === 0) {
        toast({
          variant: "error",
          title: "Nada para exportar",
          description: "Nenhum pedido encontrado com os filtros atuais.",
        });
        return;
      }
      await write(orders);

      // Depois de escrever: o arquivo cortado ainda serve, o que não pode
      // faltar é o aviso de que ele não é a lista inteira. Sem isto, quem soma
      // a coluna no Excel fecha um número menor do que o da tela e não tem como
      // desconfiar.
      if (truncated) {
        toast({
          variant: "warning",
          title: "Arquivo incompleto",
          description: `O arquivo saiu com ${orders.length} pedido(s) — o recorte é grande demais para uma exportação só. Filtre um período menor para levar o resto.`,
        });
      }
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível exportar",
        description: "Tente novamente em instantes.",
      });
    }
  };

  return {
    exportSheet: () =>
      runExport((orders) =>
        downloadSheet(
          "pedidos.xlsx",
          [EXPORT_HEADERS, ...buildExportRows(orders)],
          "Pedidos"
        )
      ),
    exportPdf: () =>
      runExport((orders) =>
        exportOrdersPdf(orders, {
          companyName,
          companyLogoUrl,
          filterFields,
          inputValues,
          order,
          scopeLabel,
        })
      ),
  };
}
