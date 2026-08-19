import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useMemo } from "react";

import { useReconciliation } from "@/hooks/useReconciliation";
import { SheetMatrix } from "@/utils/import/reader";

import { PRODUCT_UNIT_LABELS_QUERY, PRODUCT_UNITS_QUERY } from "./gql";
import { ProductUnitLabelsData, ProductUnitsData } from "./interface";

// Catálogos pequenos carregados por inteiro (ver useCompleteList).
const CATALOG_INPUT = {};
const getUnits = (d: ProductUnitsData) => d.productUnits;
const getLabels = (d: ProductUnitLabelsData) => d.productUnitLabels;

interface PriceListCatalogArgs {
  /** A grade lida; enquanto ausente, as queries de catálogo ficam suspensas. */
  matrix: SheetMatrix | null;
  /** Valores distintos das colunas de unidade/embalagem, para reconciliar. */
  distinctUnits: string[];
  distinctPacks: string[];
}

/**
 * Catálogo de unidades/embalagens do sistema + reconciliação com os valores
 * crus da planilha. Costura autocontida do wizard de importação: recebe a
 * grade e os valores distintos, devolve os rótulos canônicos e o casamento
 * (recon/setFinal) — sem tocar no resto do estado do wizard.
 */
export function usePriceListCatalog({
  matrix,
  distinctUnits,
  distinctPacks,
}: PriceListCatalogArgs) {
  const { data: unitsData, error: unitsError } =
    useCompleteList<ProductUnitsData>(
      PRODUCT_UNITS_QUERY,
      CATALOG_INPUT,
      getUnits,
      { skip: !matrix }
    );
  const { data: labelsData, error: labelsError } =
    useCompleteList<ProductUnitLabelsData>(
      PRODUCT_UNIT_LABELS_QUERY,
      CATALOG_INPUT,
      getLabels,
      { skip: !matrix }
    );
  const unitLabels = useMemo(
    () => unitsData?.productUnits.edges.map((e) => e.node.label) ?? [],
    [unitsData]
  );
  const packLabels = useMemo(
    () => labelsData?.productUnitLabels.edges.map((e) => e.node.label) ?? [],
    [labelsData]
  );

  const { recon: unitRecon, setFinal: setUnitFinal } = useReconciliation(
    distinctUnits,
    unitLabels
  );
  const { recon: packRecon, setFinal: setPackFinal } = useReconciliation(
    distinctPacks,
    packLabels
  );

  useQueryErrorToast(
    unitsError ?? labelsError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return {
    unitLabels,
    packLabels,
    unitRecon,
    setUnitFinal,
    packRecon,
    setPackFinal,
  };
}
