"use client";

import { DocumentNumber } from "@/components/DocumentNumber";
import { Table } from "@/components/Table";
import { Client } from "../../interface";

/**
 * Só no cartão (celular/tablet): o nome oficial e o CNPJ em linhas com rótulo.
 *
 * No desktop eles moram dentro da coluna "Cliente" (ClientCell), sob o nome,
 * e o cabeçalho explica a coluna. No cartão não há cabeçalho: soltos, sem
 * rótulo, ninguém sabia qual linha era o quê (14/11/2026).
 */
export function ClientIdentityCells({ client }: { client: Client }) {
  // Com apelido no título, a linha de baixo é a razão social (a da nota).
  const officialName = client.nickname
    ? client.razaoSocial
    : client.nomeFantasia;

  return (
    <>
      {officialName && (
        <Table.Cell
          variant="dim"
          className="desktop:hidden"
          label={client.nickname ? "Razão social" : "Nome fantasia"}
        >
          {officialName}
        </Table.Cell>
      )}
      <Table.Cell variant="dim" className="desktop:hidden" label="CNPJ">
        <DocumentNumber value={client.cnpj} />
      </Table.Cell>
    </>
  );
}
