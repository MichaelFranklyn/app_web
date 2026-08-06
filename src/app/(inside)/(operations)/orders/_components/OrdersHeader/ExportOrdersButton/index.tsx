"use client";

import { useApolloClient } from "@apollo/client/react";

import { FilterField } from "@/components/Filters";
import { ExportMenu } from "@/components/ExportMenu";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { downloadSheet } from "@/utils/import/writer";
import { ReportOrder } from "@/utils/pdf/context";

import { ORDERS_QUERY } from "../../../gql";
import { Order, QueryData } from "../../../interface";
import { exportOrdersPdf } from "../../../pdf";
import { EXPORT_HEADERS, buildExportRows } from "./utils";

/** Filtro no formato que a query espera (campo, operador e valor). */
export interface QueryFilter {
  field: string;
  value: string;
  operator?: string;
}

interface Props {
  /** O MESMO recorte da tabela: filtros do painel + o da aba corrente. */
  filters: QueryFilter[];
  /** Campos do painel, para o PDF escrever o recorte por extenso. */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  /** Ordenação à vista na tabela; o arquivo sai na MESMA ordem. */
  order?: ReportOrder | null;
  /** Aba corrente, quando ela restringe a lista ("Ainda não faturados"). */
  scopeLabel?: string | null;
  disabled?: boolean;
}

/** Página do backend na varredura e teto de segurança contra cursor quebrado. */
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

/**
 * Baixa os pedidos do recorte à vista em planilha (.xlsx) — para somar e cruzar
 * com a fábrica — ou em PDF — para imprimir e levar para a reunião.
 *
 * A tela pagina de 15 em 15, então exportar o que está em memória daria um
 * arquivo de quinze linhas. Aqui a query é refeita sob demanda, varrendo todas
 * as páginas com os mesmos filtros E a mesma ordenação que o usuário aplicou —
 * exportar é levar embora a lista que está à vista, não outra parecida.
 */
export function ExportOrdersButton({
  filters,
  filterFields,
  inputValues,
  order,
  scopeLabel,
  disabled,
}: Props) {
  const apollo = useApolloClient();
  const { toast } = useToast();
  // Logo e nome da representação no cabeçalho do documento impresso.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  const fetchAllOrders = async (): Promise<Order[]> => {
    const all: Order[] = [];
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page++) {
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

      const { hasNextPage, endCursor } = connection.pageInfo ?? {};
      if (!hasNextPage || !endCursor) break;
      after = endCursor;
    }

    return all;
  };

  /** Varre a lista e entrega ao formato pedido; nada baixa se vier vazia. */
  const runExport = async (write: (orders: Order[]) => Promise<void>) => {
    try {
      const orders = await fetchAllOrders();
      if (orders.length === 0) {
        toast({
          variant: "error",
          title: "Nada para exportar",
          description: "Nenhum pedido encontrado com os filtros atuais.",
        });
        return;
      }
      await write(orders);
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível exportar",
        description: "Tente novamente em instantes.",
      });
    }
  };

  return (
    <ExportMenu
      disabled={disabled}
      onExportSheet={() =>
        runExport((orders) =>
          downloadSheet(
            "pedidos.xlsx",
            [EXPORT_HEADERS, ...buildExportRows(orders)],
            "Pedidos"
          )
        )
      }
      onExportPdf={() =>
        runExport((orders) =>
          exportOrdersPdf(orders, {
            companyName,
            companyLogoUrl,
            filterFields,
            inputValues,
            order,
            scopeLabel,
          })
        )
      }
    />
  );
}
