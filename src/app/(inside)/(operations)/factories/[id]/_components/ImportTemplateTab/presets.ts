/**
 * Presets de "modelo de pedido" por fábrica, em linguagem concreta para o
 * público não-técnico. Cada preset diz o tipo de arquivo, a estratégia de
 * parsing (enum do backend) e como montar o `config` salvo no template.
 */

export type TemplateFileKind = "pdf" | "spreadsheet";

export interface PresetMeta {
  id: string;
  label: string;
  description: string;
  fileKind: TemplateFileKind;
  /** Enum ParserStrategy do backend. */
  parserStrategy: "FIXED_LAYOUT" | "COLUMN_MAPPING";
}

/** Presets de PDF (extraídos por receita determinística no backend). */
export const PDF_PRESETS: PresetMeta[] = [
  {
    id: "prefix_dash",
    label: "Código e descrição na mesma linha",
    description:
      "Cada item ocupa uma linha que começa pelo código, seguido de “ - descrição”, a quantidade e o preço. Ex.: pedidos Mundial.",
    fileKind: "pdf",
    parserStrategy: "FIXED_LAYOUT",
  },
  {
    id: "indexed_tail",
    label: "Código no começo, valores no fim",
    description:
      "Cada item numa linha: número, código, unidade, descrição e, no fim, a quantidade e os preços. Ex.: pedidos Lukma.",
    fileKind: "pdf",
    parserStrategy: "FIXED_LAYOUT",
  },
  {
    id: "multiline_block",
    label: "Item em várias linhas",
    description:
      "Cada item ocupa várias linhas (a descrição quebra em linhas). Ex.: pedidos Quartzolit/Weber.",
    fileKind: "pdf",
    parserStrategy: "FIXED_LAYOUT",
  },
  {
    id: "columnar",
    label: "Pedido em grade (colunas)",
    description:
      "Cada item numa linha, em colunas: código, descrição, quantidade e preço (R$), com o preço alinhado à direita. Ex.: pedidos Delta/Contato.",
    fileKind: "pdf",
    parserStrategy: "FIXED_LAYOUT",
  },
];

/** Preset de planilha (Excel/CSV): mapeamento de colunas feito na tela. */
export const SPREADSHEET_PRESET: PresetMeta = {
  id: "column_mapping",
  label: "Planilha com colunas",
  description:
    "O pedido vem em Excel/CSV com colunas. Você aponta qual coluna é o código, a quantidade e o preço.",
  fileKind: "spreadsheet",
  parserStrategy: "COLUMN_MAPPING",
};

export const ALL_PRESETS: PresetMeta[] = [...PDF_PRESETS, SPREADSHEET_PRESET];

export const presetById = (id: string | undefined): PresetMeta | undefined =>
  ALL_PRESETS.find((p) => p.id === id);

export const isPdfName = (name: string): boolean => /\.pdf$/i.test(name);
