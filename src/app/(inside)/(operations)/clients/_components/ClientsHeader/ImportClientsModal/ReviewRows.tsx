"use client";

import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { maskCNPJ } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";

import { ImportClientRow } from "./interface";

const MAX_ROWS = 50;

const COLUMNS: {
  label: string;
  render: (row: ImportClientRow) => string | null;
}[] = [
  { label: "CNPJ", render: (row) => maskCNPJ(row.cnpj) },
  { label: "Vendedor", render: (row) => row.sellerEmail },
  { label: "Fábrica", render: (row) => row.factoryName },
  { label: "Código na fábrica", render: (row) => row.factoryClientCode },
  { label: "Observações", render: (row) => row.notes },
];

/**
 * Passo 2: o que foi lido da planilha, antes de enviar. Vazio aqui é "—", não
 * "Não informado": numa planilha de CNPJs quase toda linha tem campo em branco
 * (vendedor, fábrica, código), e a frase repetida virava ruído na tabela.
 */
export function ReviewRows({ rows }: { rows: ImportClientRow[] }) {
  const visible = rows.slice(0, MAX_ROWS);
  const hidden = rows.length - visible.length;
  const clients = new Set(rows.map((row) => row.cnpj)).size;

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium">
        {plural(clients, "cliente", "clientes")} em{" "}
        {plural(rows.length, "linha lida", "linhas lidas")} da planilha
      </Title>

      <Table.Root>
        <Table.Table maxHeight={320}>
          <Table.Header>
            <Table.Row>
              {COLUMNS.map((col) => (
                <Table.Head key={col.label}>{col.label}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((row, index) => (
              <Table.Row key={`${row.cnpj}-${index}`}>
                {COLUMNS.map((col) => (
                  <Table.Cell key={col.label} label={col.label} emptyText="—">
                    {col.render(row) || "—"}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Table>
      </Table.Root>

      {hidden > 0 && (
        <Title variant="caption" color="muted">
          Mostrando as primeiras {MAX_ROWS} linhas — mais {hidden} serão
          importadas.
        </Title>
      )}
    </div>
  );
}
