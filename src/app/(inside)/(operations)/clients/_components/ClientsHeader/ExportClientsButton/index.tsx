"use client";

import { useApolloClient } from "@apollo/client/react";
import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { buildQueryFilters } from "@/hooks/useTableData";
import { downloadSheet } from "@/utils/import/writer";

import { CLIENTS_QUERY } from "../../../gql";
import { Client, ClientsQueryResponse } from "../../../interface";
import { TABLE_FIELDS } from "../../../utils";
import { EXPORT_HEADERS, buildExportRows } from "./utils";

interface Props {
  /** Filtros ativos na tela: o arquivo sai com o mesmo recorte que está à vista. */
  inputValues: Record<string, string>;
  disabled?: boolean;
}

/** Página do backend na varredura e teto de segurança contra cursor quebrado. */
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

/**
 * Baixa a carteira em planilha (.xlsx) — mesmo formato dos modelos de importação,
 * que abre no Excel sem diálogo de separador e sem perder acento.
 *
 * A lista da tela pagina de 5 em 5, então exportar o que está em memória daria
 * um arquivo de cinco linhas. Aqui a query é refeita sob demanda, varrendo todas
 * as páginas com o mesmo filtro de busca/vendedor que o usuário aplicou.
 */
export function ExportClientsButton({ inputValues, disabled }: Props) {
  const [busy, setBusy] = useState(false);
  const apollo = useApolloClient();
  const { toast } = useToast();

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

  const handleExport = async () => {
    setBusy(true);
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
      await downloadSheet(
        "clientes.xlsx",
        [EXPORT_HEADERS, ...buildExportRows(clients)],
        "Clientes"
      );
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível exportar",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button.Root
      appearance="outline"
      color="neutral"
      size="sm"
      noUppercase
      loading={busy}
      disabled={disabled}
      onClick={handleExport}
    >
      <Button.Icon icon={Download} />
      <Button.Title>Exportar</Button.Title>
    </Button.Root>
  );
}
