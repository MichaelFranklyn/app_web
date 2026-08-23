"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { maskCNPJ } from "@/utils/format/masks";
import { Client } from "../../interface";

interface ClientCellProps {
  client: Client;
}

/**
 * Identificação do cliente em uma coluna só: nome, nome fantasia e o CNPJ.
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
    <Table.Cell>
      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-8">
          {/* Nome em uma linha só e por extenso — o `nowrap` vem da própria
              `Table.Cell`. */}
          <Table.CellText variant="strong" className="block">
            {client.razaoSocial}
          </Table.CellText>
          {client.isNeedsAttention && (
            <Tooltip
              className="max-w-100 whitespace-normal"
              content={
                <div className="flex flex-col gap-2 text-left normal-case">
                  <Title variant="label" color="amber">
                    Precisa de atenção
                  </Title>
                  <Title variant="body-sm">
                    {client.attentionReason ?? "Revise os dados deste cliente."}
                  </Title>
                </div>
              }
            >
              <Badge.Root color="amber" appearance="tinted">
                <Badge.Text>Precisa de atenção</Badge.Text>
              </Badge.Root>
            </Tooltip>
          )}
        </div>

        {client.nomeFantasia && (
          <Table.CellText variant="dim" className="block">
            {client.nomeFantasia}
          </Table.CellText>
        )}

        {/* A linha existe para o badge não esticar na largura da coluna: numa
            flex-col ele herdaria o `stretch` do container. */}
        <div className="flex items-center gap-8">
          <Badge.Root color="subtle" appearance="tinted">
            <Badge.Text>{maskCNPJ(client.cnpj)}</Badge.Text>
          </Badge.Root>
        </div>
      </div>
    </Table.Cell>
  );
}
