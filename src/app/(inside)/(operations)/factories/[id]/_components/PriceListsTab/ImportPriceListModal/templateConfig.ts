import { ColumnChoice } from "../../_import/columns";
import { MappingState } from "../../ProductsTab/ImportProductsModal/mapping";
import { StMvaChoices } from "./StMvaFields";
import { TaxColumn, TierColumn } from "./interface";

/**
 * Config salvo no template de tabela de preço (target PRICE_LIST). É o estado de
 * mapeamento do modal — NÃO inclui nome/região/vigência (esses são por importação).
 */
export interface PriceListTemplateConfig {
  headerIndex: number;
  mapping: MappingState;
  tierColumns: TierColumn[];
  ipiChoice: ColumnChoice;
  ipiAsFraction: boolean;
  ncmChoice: ColumnChoice;
  taxColumns: TaxColumn[];
  stMva: StMvaChoices;
  pricesPerUnit: boolean;
  taxesAsFraction: boolean;
}

/** Aceita o config (vindo do backend como JSON) e garante a forma esperada. */
export const isPriceListConfig = (
  value: unknown
): value is PriceListTemplateConfig =>
  !!value && typeof value === "object" && "mapping" in value && "tierColumns" in value;
