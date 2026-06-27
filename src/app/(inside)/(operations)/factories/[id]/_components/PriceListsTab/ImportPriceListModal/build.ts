import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import { SheetData } from "@/utils/import/reader";
import {
  isMappingComplete,
  MappingState,
} from "../../ProductsTab/ImportProductsModal/mapping";
import { TaxColumn, TierColumn } from "./interface";
import { isStMvaComplete, StMvaChoices } from "./StMvaFields";

const sub = (value: string, table?: Record<string, string>): string =>
  (table && table[value]) || value;

export interface BuildArgs {
  companyFactoryId: string;
  data: SheetData;
  mapping: MappingState;
  unitRecon: Record<string, string>;
  labelRecon: Record<string, string>;
  tierColumns: TierColumn[];
  ipiChoice: ColumnChoice;
  /** NCM (classificação fiscal) do produto — opcional. */
  ncmChoice: ColumnChoice;
  /** Impostos aditivos simples além do IPI (ICMS, FECP...). */
  taxColumns: TaxColumn[];
  /** Componentes do ST por MVA; ativo quando as três origens estão definidas. */
  stMva: StMvaChoices;
  listName: string;
  region: string;
  validFrom: string;
  validUntil: string | null;
  /** Preços da planilha por unidade base: o backend converte para preço por embalagem. */
  pricesPerUnit: boolean;
  /** IPI da planilha em fração decimal (0,0325): o backend converte para percentual (×100). */
  ipiAsFraction: boolean;
  /** Alíquotas de `taxes` (rate/MVA/crédito/interna) em fração decimal: backend converte (×100). */
  taxesAsFraction: boolean;
}

/** Só estes exigem mapeamento: categoria/unidade/rótulo têm padrão no backend. */
export const PRICE_REQUIRED_FIELDS = ["sku", "name", "unitPerPack"];

const validTiersOf = (tierColumns: TierColumn[]) =>
  tierColumns.filter((t) => t.columnIndex !== null && t.tierName.trim() !== "");

const validTaxesOf = (taxColumns: TaxColumn[]) =>
  taxColumns.filter((t) => t.columnIndex !== null && t.taxName.trim() !== "");

export const hasConfiguredTaxes = (
  args: Pick<BuildArgs, "taxColumns" | "stMva">
): boolean =>
  validTaxesOf(args.taxColumns).length > 0 || isStMvaComplete(args.stMva);

/** Pré-condições para habilitar a importação. */
export const canImport = (args: BuildArgs): boolean =>
  args.listName.trim() !== "" && args.validFrom !== "" && canSaveTemplate(args);

/**
 * Pré-condições para salvar o modelo (mapeamento) da fábrica. NÃO exige
 * nome/vigência: esses são por importação e não entram no config do template.
 * Basta o mapeamento do produto completo e ao menos um nível de preço.
 */
export const canSaveTemplate = (
  args: Pick<BuildArgs, "tierColumns" | "mapping">
): boolean =>
  validTiersOf(args.tierColumns).length > 0 &&
  isMappingComplete(args.mapping, PRICE_REQUIRED_FIELDS);

const buildRowTaxes = (
  cells: string[],
  taxColumns: TaxColumn[],
  stMva: StMvaChoices
): Array<Record<string, unknown>> => {
  const taxes: Array<Record<string, unknown>> = [];

  for (const tax of validTaxesOf(taxColumns)) {
    const rate = parseNumber(String(cells[tax.columnIndex as number] ?? ""));
    if (Number.isFinite(rate)) {
      taxes.push({ name: tax.taxName.trim(), calcType: "RATE", rate });
    }
  }

  if (isStMvaComplete(stMva)) {
    const mva = parseNumber(valueForChoice(stMva.mva, cells));
    const icmsCreditRate = parseNumber(valueForChoice(stMva.icmsCredit, cells));
    const internalRate = parseNumber(valueForChoice(stMva.internalRate, cells));
    if ([mva, icmsCreditRate, internalRate].every(Number.isFinite)) {
      taxes.push({
        name: "ST",
        calcType: "ST_MVA",
        mva,
        icmsCreditRate,
        internalRate,
      });
    }
  }

  return taxes;
};

interface ImportRowPayload {
  sku: string;
  name: string;
  unitPerPack: number;
  [key: string]: unknown;
}

/**
 * Linha importável: tem SKU, nome e embalagem numérica > 0. Planilhas reais
 * trazem linhas de título/totais/observações no meio dos dados — mandá-las
 * adiante faria o GraphQL rejeitar a mutation inteira (NaN vira null em
 * unitPerPack, que é Decimal não-nulo).
 */
// Produto de verdade tem código E descrição. Sem isso é lixo (título, total,
// observação no meio dos dados) e fica de fora.
const hasIdentity = (row: ImportRowPayload): boolean =>
  row.sku !== "" && row.name !== "";

// Múltiplo/embalagem ausente NÃO descarta o produto: alguns setores da planilha
// (ex.: calçados) não trazem múltiplo. Assume 1 e marca para revisão posterior.
const hasValidPack = (row: ImportRowPayload): boolean =>
  Number.isFinite(row.unitPerPack) && row.unitPerPack > 0;

export const buildImportInput = (args: BuildArgs) => {
  const { data, mapping, unitRecon, labelRecon, ipiChoice, ncmChoice } = args;
  const validTiers = validTiersOf(args.tierColumns);
  const importIpi = ipiChoice.kind !== "none";

  const allRows = data.rows.map((cells) => {
    const prices = validTiers
      .map((t) => ({
        tierName: t.tierName.trim(),
        unitPrice: parseNumber(String(cells[t.columnIndex as number] ?? "")),
      }))
      .filter((p) => Number.isFinite(p.unitPrice));

    const ipiRaw = importIpi
      ? parseNumber(valueForChoice(ipiChoice, cells))
      : NaN;
    const ncm = valueForChoice(ncmChoice, cells).trim();
    // Vazios viram null — o backend aplica os padrões (Geral / Unidade).
    const category = valueForChoice(mapping.category, cells).trim();
    const unit = sub(valueForChoice(mapping.unit, cells).trim(), unitRecon);
    const unitLabel = sub(
      valueForChoice(mapping.unitLabel, cells).trim(),
      labelRecon
    );

    return {
      sku: valueForChoice(mapping.sku, cells).trim(),
      name: valueForChoice(mapping.name, cells).trim(),
      category: category || null,
      unit: unit || null,
      unitLabel: unitLabel || null,
      unitPerPack: parseNumber(valueForChoice(mapping.unitPerPack, cells)),
      ncm: ncm || null,
      ipiRate: Number.isFinite(ipiRaw) ? ipiRaw : null,
      taxes: buildRowTaxes(cells, args.taxColumns, args.stMva),
      prices,
    };
  });

  // Produtos identificáveis entram; quem não tem múltiplo válido entra com 1.
  // packDefaulted marca esses para o backend sinalizar "Precisa de atenção".
  const identified = allRows.filter(hasIdentity);
  const rows = identified.map((row) =>
    hasValidPack(row)
      ? { ...row, packDefaulted: false }
      : { ...row, unitPerPack: 1, packDefaulted: true }
  );
  // Importados com múltiplo assumido = 1 (para avisar o usuário a revisar).
  const defaultedPack = identified
    .filter((row) => !hasValidPack(row))
    .map((row) => ({ sku: row.sku, name: row.name }));
  // Linhas sem identidade ficam de fora — listadas (com motivo) no resultado.
  const skipped = allRows
    .filter((row) => !hasIdentity(row))
    .map((row) => ({
      sku: row.sku,
      name: row.name,
      reason: !row.sku ? "sem código" : "sem descrição",
    }));

  return {
    input: {
      companyFactoryId: args.companyFactoryId,
      listName: args.listName.trim(),
      region: args.region.trim(),
      validFrom: args.validFrom,
      validUntil: args.validUntil || null,
      tiers: validTiers.map((t) => t.tierName.trim()),
      importIpi,
      ipiAsFraction: args.ipiAsFraction,
      taxesAsFraction: args.taxesAsFraction,
      pricesPerUnit: args.pricesPerUnit,
      rows,
    },
    /** Linhas da planilha que ficaram de fora (sem código ou sem descrição). */
    skippedRows: skipped.length,
    skipped,
    /** Produtos importados com múltiplo assumido = 1 (revisar depois). */
    defaultedPack,
  };
};
