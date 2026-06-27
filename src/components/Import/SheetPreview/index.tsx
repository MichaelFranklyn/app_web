"use client";

import { Title } from "@/components/Title";
import { SheetData } from "@/utils/import/reader";

const MAX_ROWS = 3;

export function SheetPreview({ data }: { data: SheetData }) {
  if (data.headers.length === 0) return null;

  const rows = data.rows.slice(0, MAX_ROWS);

  return (
    <div className="overflow-x-auto rounded-(--r-md) border border-(--border)">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-(--bg2)">
            {data.headers.map((header, index) => (
              <th key={index} className="px-8 py-6 whitespace-nowrap">
                <Title variant="caption" weight="medium">
                  {header || `Coluna ${index + 1}`}
                </Title>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-(--border)">
              {data.headers.map((_, colIndex) => (
                <td key={colIndex} className="px-8 py-6 whitespace-nowrap">
                  <Title variant="caption" color="muted">
                    {row[colIndex] ?? ""}
                  </Title>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
