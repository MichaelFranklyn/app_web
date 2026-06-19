"use client";

import { Title } from "@/components/Title";

import { ImportProductRow } from "./interface";

const MAX_ROWS = 50;

const COLUMNS: { label: string; render: (row: ImportProductRow) => string }[] = [
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

      <div className="max-h-[320px] overflow-auto rounded-(--r-md) border border-(--border)">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0">
            <tr className="bg-(--bg2)">
              {COLUMNS.map((col) => (
                <th key={col.label} className="whitespace-nowrap px-8 py-6">
                  <Title variant="caption" weight="medium">
                    {col.label}
                  </Title>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={`${row.sku}-${index}`} className="border-t border-(--border)">
                {COLUMNS.map((col) => (
                  <td key={col.label} className="whitespace-nowrap px-8 py-6">
                    <Title variant="caption" color="muted">
                      {col.render(row)}
                    </Title>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hidden > 0 && (
        <Title variant="caption" color="muted">
          Mostrando as primeiras {MAX_ROWS} linhas — mais {hidden} serão importadas.
        </Title>
      )}
    </div>
  );
}
