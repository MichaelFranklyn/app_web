import { ColumnChoice } from "@/utils/import/columns";
import { ImportProductRow } from "./interface";

export type { ColumnChoice };

export interface TargetField {
  key: keyof ImportProductRow;
  label: string;
  /** Texto do tooltip de ajuda exibido ao lado do label. */
  description: string;
  /** Exemplo sugerido quando o usuário escolhe "valor fixo". */
  fixedExample?: string;
}

export const TARGET_FIELDS: TargetField[] = [
  {
    key: "sku",
    label: "SKU",
    description:
      "Código único do produto na fábrica (ex.: 101, ABC-123). É por ele que reconhecemos produtos já cadastrados para não duplicar.",
  },
  {
    key: "name",
    label: "Nome do produto",
    description:
      "Nome comercial do produto, como o vendedor vê na hora de montar o pedido.",
  },
  {
    key: "category",
    label: "Categoria",
    description:
      "Família ou grupo do produto (ex.: TORNEIRAS JARDIM). Categorias que não existirem são criadas automaticamente.",
    fixedExample: "Geral",
  },
  {
    key: "unit",
    label: "Unidade",
    description:
      "Unidade base: o que se mede ou conta — Peça, Quilograma, Litro, Metro… Não é a embalagem. Se a planilha não tiver essa coluna, use um valor fixo.",
    fixedExample: "Peça",
  },
  {
    key: "unitLabel",
    label: "Rótulo de embalagem",
    description:
      "Como o produto é vendido fechado: Caixa, Saco, Fardo, Pacote… O preço da tabela é sempre desta embalagem. Se a planilha não tiver essa coluna, use um valor fixo.",
    fixedExample: "Caixa",
  },
  {
    key: "unitPerPack",
    label: "Unidades por embalagem",
    description:
      'Quantas unidades base cabem em 1 embalagem (Caixa com 12 Peças → 12). Nas planilhas de fábrica costuma ser a coluna "UNIDADE DE VENDA".',
    fixedExample: "1",
  },
];

export type MappingState = Record<string, ColumnChoice>;

/** Heurística simples: tenta casar cada campo com uma coluna pelo nome do cabeçalho. */
const GUESS_HINTS: Record<string, string[]> = {
  // "modelo" identifica o produto em catálogos sem coluna de código (ex.: tabela
  // Lukma, onde "UNIPOLAR LK-2" é o próprio código). Fica por último: se houver
  // "código" de fato, ele ganha; "modelo" sobra como nome (fallback abaixo).
  sku: [
    "sku",
    "código",
    "codigo",
    "cód",
    "cod.",
    "ref",
    "referência",
    "modelo",
  ],
  name: ["nome", "produto", "descrição", "descricao", "item", "modelo"],
  category: ["categoria", "grupo", "linha", "família", "familia"],
  // unidade de venda / múltiplo costuma ser o número de unidades por embalagem.
  // "embal." (abreviado, com ponto) é a coluna EMBAL. das fichas de pedido —
  // não confunde com "embalagem" por extenso, que é rótulo (unitLabel).
  unitPerPack: [
    "por embalagem",
    "unidade de venda",
    "venda",
    "múltiplo",
    "multiplo",
    "fator",
    "embal.",
    "qtd",
    "quantidade",
  ],
  unit: ["unidade", "unid", "medida", "un"],
  unitLabel: ["embalagem", "rótulo", "rotulo", "caixa", "pacote", "fardo"],
};

// Cabeçalhos que invalidam o palpite mesmo contendo um hint (ex.: "CAIXA
// MÁSTER" é caixa de transporte/logística, não a embalagem de venda).
const GUESS_EXCLUDE: Record<string, string[]> = {
  unitLabel: ["máster", "master"],
};

// Ordem de prioridade ao reivindicar colunas (campos mais específicos primeiro,
// para que "unidade de venda" caia em unitPerPack e não em unit).
const GUESS_ORDER = [
  "sku",
  "name",
  "category",
  "unitPerPack",
  "unit",
  "unitLabel",
];

export const autoGuessMapping = (headers: string[]): MappingState => {
  const mapping: MappingState = {};
  const used = new Set<number>();

  for (const key of GUESS_ORDER) {
    const hints = GUESS_HINTS[key] ?? [];
    const excludes = GUESS_EXCLUDE[key] ?? [];
    const index = headers.findIndex((h, i) => {
      if (used.has(i)) return false;
      const lower = h.toLowerCase();
      if (excludes.some((hint) => lower.includes(hint))) return false;
      return hints.some((hint) => lower.includes(hint));
    });
    if (index >= 0) {
      used.add(index);
      mapping[key] = { kind: "column", index };
    } else {
      mapping[key] = { kind: "none" };
    }
  }

  return mapping;
};

/**
 * Verifica se os campos exigidos têm origem definida. Por padrão exige todos
 * (importação de produtos); a importação de tabela de preço passa só os
 * obrigatórios dela — categoria/unidade/rótulo têm padrão no backend.
 */
export const isMappingComplete = (
  mapping: MappingState,
  requiredKeys: string[] = TARGET_FIELDS.map((f) => String(f.key))
): boolean =>
  requiredKeys.every((key) => {
    const choice = mapping[key];
    if (!choice) return false;
    if (choice.kind === "column") return true;
    if (choice.kind === "fixed") return choice.value.trim() !== "";
    return false;
  });
