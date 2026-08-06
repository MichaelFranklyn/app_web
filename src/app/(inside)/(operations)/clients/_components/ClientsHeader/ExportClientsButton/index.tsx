"use client";

import { useApolloClient } from "@apollo/client/react";

import { ExportMenu } from "@/components/ExportMenu";
import { FilterField } from "@/components/Filters";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { buildQueryFilters } from "@/hooks/useTableData";
import { downloadSheet } from "@/utils/import/writer";
import { ReportOrder } from "@/utils/pdf/context";

import { CLIENTS_QUERY } from "../../../gql";
import { Client, ClientsQueryResponse } from "../../../interface";
import { exportClientsPdf } from "../../../pdf";
import { TABLE_FIELDS } from "../../../utils";
import { EXPORT_HEADERS, buildExportRows } from "./utils";

interface Props {
  /** Filtros ativos na tela: o arquivo sai com o mesmo recorte que está à vista. */
  inputValues: Record<string, string>;
  /** Campos do painel, para o PDF escrever o recorte por extenso. */
  filterFields: FilterField[];
  /** Ordenação à vista na tabela; o arquivo sai na MESMA ordem. */
  order?: ReportOrder | null;
  disabled?: boolean;
}

/** Página do backend na varredura e teto de segurança contra cursor quebrado. */
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

/**
 * Baixa a carteira em planilha (.xlsx) — para trabalhar os dados — ou em PDF —
 * para imprimir e levar para a rua.
 *
 * A lista da tela pagina de 5 em 5, então exportar o que está em memória daria
 * um arquivo de cinco linhas. Aqui a query é refeita sob demanda, varrendo todas
 * as páginas com os mesmos filtros E a mesma ordenação que o usuário aplicou —
 * exportar é levar embora a lista que está à vista, não outra parecida.
 */
export function ExportClientsButton({
  inputValues,
  filterFields,
  order,
  disabled,
}: Props) {
  const apollo = useApolloClient();
  const { toast } = useToast();
  // Logo e nome da representação no cabeçalho do documento impresso.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  const fetchAllClients = async (): Promise<Client[]> => {
    const filters = buildQueryFilters(TABLE_FIELDS, inputValues);
    const all: Client[] = [];
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page++) {
      const result: { data?: ClientsQueryResponse } =
        await apollo.query<ClientsQueryResponse>({
          query: CLIENTS_QUERY,
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

      const connection = result.data?.clients_list;
      if (!connection) break;
      all.push(...connection.edges.map((edge) => edge.node));

      const { hasNextPage, endCursor } = connection.pageInfo ?? {};
      if (!hasNextPage || !endCursor) break;
      after = endCursor;
    }

    return all;
  };

  /** Varre a carteira e entrega ao formato pedido; nada baixa se vier vazia. */
  const runExport = async (write: (clients: Client[]) => Promise<void>) => {
    try {
      const clients = await fetchAllClients();
      if (clients.length === 0) {
        toast({
          variant: "error",
          title: "Nada para exportar",
          description: "Nenhum cliente encontrado com os filtros atuais.",
        });
        return;
      }
      await write(clients);
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
        runExport((clients) =>
          downloadSheet(
            "clientes.xlsx",
            [EXPORT_HEADERS, ...buildExportRows(clients)],
            "Clientes"
          )
        )
      }
      onExportPdf={() =>
        runExport((clients) =>
          exportClientsPdf(clients, {
            companyName,
            companyLogoUrl,
            filterFields,
            inputValues,
            order,
          })
        )
      }
    />
  );
}
