"use client";

import { Table } from "@/components/Table";
import { Title } from "@/components/Title";

import { ImportProductRow } from "./interface";

const MAX_ROWS = 50;

const COLUMNS: { label: string; render: (row: ImportProductRow) => string }[] =
  [
    { label: "SKU", render: (row) => row.sku },
    { label: "Nome", render: (row) => row.name },
    { label: "Categoria", render: (row) => row.category },
    { label: "Unidade", render: (row) => row.unit },
    { label: "Embalagem", render: (row) => row.unitLabel },
    { label: "Un./embalagem", render: (row) => String(row.unitPerPack) },
  ];

export function ReviewRows({ rows }: { rows: ImportProductRow[] }) {
  const visible = rows.slice(0, MAX_ROWS);
  const hidden = rows.length - visible.length;

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium">
        {rows.length} produto(s) lidos da planilha
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
              <Table.Row key={`${row.sku}-${index}`}>
                {COLUMNS.map((col) => (
                  <Table.Cell key={col.label}>
                    <Table.CellText variant="dim">
                      {col.render(row)}
                    </Table.CellText>
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
