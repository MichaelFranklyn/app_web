import { downloadCSV } from "@/utils/format/csv";

import { ImportProductRow } from "./interface";

/**
 * Cabeçalho da planilha modelo. A ordem das colunas define o mapeamento posicional
 * em `rowToInput` — manter sincronizado.
 */
const EXAMPLE_HEADERS = [
  "SKU",
  "Nome do produto",
  "Categoria",
  "Unidade",
  "Rótulo de embalagem",
  "Unidades por embalagem",
];

const EXAMPLE_ROWS = [
  ["CIM-50KG", "Cimento CP-II 50kg", "Cimentos", "Saco", "Pallet", "12"],
  ["ARG-20KG", "Argamassa AC-III 20kg", "Argamassas", "Saco", "Pallet", "40"],
];

export const downloadExampleSheet = (): void => {
  downloadCSV("modelo-importacao-produtos.csv", [EXAMPLE_HEADERS, ...EXAMPLE_ROWS]);
};

/** Mapeia uma linha da planilha modelo (ordem fixa de colunas) para a mutation. */
export const rowToInput = (cells: string[]): ImportProductRow => ({
  sku: (cells[0] ?? "").trim(),
  name: (cells[1] ?? "").trim(),
  category: (cells[2] ?? "").trim(),
  unit: (cells[3] ?? "").trim(),
  unitLabel: (cells[4] ?? "").trim(),
  unitPerPack: Number((cells[5] ?? "").trim().replace(",", ".")),
});
