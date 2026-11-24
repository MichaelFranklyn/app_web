"use client";

import { DocumentNumber } from "@/components/DocumentNumber";
import { Table } from "@/components/Table";
import { Client } from "../../interface";
import { ClientStatusTags } from "./ClientStatusTags";

interface ClientCellProps {
  client: Client;
}

/**
 * Identificação do cliente em uma coluna só: nome (o apelido da empresa, se
 * houver), nome fantasia ou oficial e o CNPJ.
 *
 * Fica só o que a pessoa usa para reconhecer o cliente. O código interno, o
 * CNAE e a descrição do ramo saíram daqui: eram três informações que ninguém
 * lê na lista e que competiam por espaço com o nome — quem precisa delas abre
 * o cliente.
 */
export function ClientCell({ client }: ClientCellProps) {
  return (
    // Sem teto de largura: a razão social aparece inteira, numa linha só, e
    // quando a soma das colunas não cabe é a tabela que rola na horizontal.
    <Table.Cell card="title">
      <div className="flex flex-col gap-2">
        {/* No cartão (celular/tablet) as tags vão para a linha do score
            (ver ClientsTable): ao lado do nome, espremiam-no. */}
        <div className="flex min-w-0 items-center gap-8">
          {/* Nome em uma linha só e por extenso — o `nowrap` vem da própria
              `Table.Cell`. */}
          <Table.CellText variant="strong" className="block">
            {client.nickname ?? client.razaoSocial}
          </Table.CellText>
          <ClientStatusTags client={client} className="max-desktop:hidden" />
        </div>

        {/* Com apelido, o nome oficial desce para cá — é ele que está na
            nota e no cadastro da Receita. */}
        {/* No cartão, ela e o CNPJ viram linhas com rótulo (ClientIdentityCells):
            soltos sob o nome, ninguém sabia o que era cada um. */}
        {(client.nickname ? client.razaoSocial : client.nomeFantasia) && (
          <Table.CellText variant="dim" className="max-desktop:hidden block">
            {client.nickname ? client.razaoSocial : client.nomeFantasia}
          </Table.CellText>
        )}

        {/* CNPJ em texto apagado, não em tarja: a tarja cinza em toda linha
            pesava tanto quanto as tags de situação ao lado do nome e brigava
            com elas pela atenção (crítica de 23/11/2026). */}
        <Table.CellText variant="dim2" className="max-desktop:hidden block">
          <DocumentNumber value={client.cnpj} />
        </Table.CellText>
      </div>
    </Table.Cell>
  );
}
