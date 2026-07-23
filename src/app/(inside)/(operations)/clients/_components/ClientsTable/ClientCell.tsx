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
 * Identificação do cliente em uma coluna só: nome, apelido/código e, embaixo,
 * CNPJ e CNAE.
 *
 * Eram três colunas. Juntá-las devolve a largura que a tabela precisa para
 * mostrar as datas e o Score sem rolagem horizontal — e nome, documento e ramo
 * são a mesma pergunta ("quem é este cliente?").
 */
export function ClientCell({ client }: ClientCellProps) {
  const code = client.id.slice(0, 8).toUpperCase();

  return (
    // max-w: sem teto, o ramo de atividade (texto longo) esticaria a coluna e
    // empurraria o Score para fora da tela. Com teto, o texto trunca em "…".
    <Table.Cell className="max-w-[420px]">
      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-8">
          {/* Nome em uma linha só: trunca em "…" e o título completo fica no
              atributo `title` (o detalhe do cliente é um clique na linha). */}
          <Table.CellText
            variant="strong"
            className="block truncate"
            title={client.razaoSocial}
          >
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

        <Table.CellText variant="dim">
          {client.nomeFantasia
            ? `${client.nomeFantasia} · Cód: ${code}`
            : `Cód: ${code}`}
        </Table.CellText>

        {/* min-w-0 + truncate: o ramo de atividade é longo e só complementa —
            encolhe até "…" em vez de empurrar o CNPJ para outra linha. */}
        <div className="flex items-center gap-8">
          <Badge.Root color="subtle" appearance="tinted">
            <Badge.Text>{maskCNPJ(client.cnpj)}</Badge.Text>
          </Badge.Root>
          <div className="min-w-0">
            <Table.CellText variant="dim" className="block truncate">
              {[client.cnae, client.cnaeDescription]
                .filter(Boolean)
                .join(" · ") || "Sem CNAE"}
            </Table.CellText>
          </div>
        </div>
      </div>
    </Table.Cell>
  );
}
