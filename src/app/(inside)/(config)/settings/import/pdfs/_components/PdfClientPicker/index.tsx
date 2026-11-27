"use client";

import { Input } from "@/components/Input";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import {
  clientDisplayName,
  clientOptionLabel,
  clientOptionSearchText,
} from "@/utils/client";

import { PDF_CLIENT_OPTIONS_QUERY } from "./gql";
import {
  PdfClientOptionNode,
  PdfClientOptionsData,
  PickedClient,
} from "./interface";

interface Props {
  value: PickedClient | null;
  onChange: (client: PickedClient | null) => void;
  disabled: boolean;
}

/** Busca na carteira o cliente de um PDF que não trouxe o CNPJ. */
export function PdfClientPicker({ value, onChange, disabled }: Props) {
  const clients = useAsyncSelectOptions<
    PdfClientOptionsData,
    PdfClientOptionNode
  >({
    query: PDF_CLIENT_OPTIONS_QUERY,
    getConnection: (data) => data.pdf_client_options,
    toOption: (node) => ({
      value: node.client?.id ?? node.id,
      label: node.client ? clientOptionLabel(node.client) : node.id,
      searchText: node.client ? clientOptionSearchText(node.client) : undefined,
    }),
    searchField: "search",
  });

  return (
    <Input.Select
      label="Cliente da carteira"
      required
      placeholder="Busque pelo nome ou CNPJ"
      variant="single"
      options={clients.options}
      onSearch={clients.onSearch}
      loading={clients.loading}
      value={value ? { value: value.id, label: value.name } : null}
      disabled={disabled}
      onChange={(val) => {
        const opt = Array.isArray(val) ? val[0] : val;
        const node = opt
          ? clients.nodes.find(
              (n) => (n.client?.id ?? n.id) === String(opt.value)
            )
          : undefined;
        onChange(
          node?.client?.cnpj
            ? {
                id: node.client.id,
                document: node.client.cnpj,
                name: clientDisplayName(node.client),
              }
            : null
        );
      }}
    />
  );
}
