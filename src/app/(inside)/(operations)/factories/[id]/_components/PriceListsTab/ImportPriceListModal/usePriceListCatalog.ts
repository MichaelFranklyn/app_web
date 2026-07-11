import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { useReconciliation } from "@/hooks/useReconciliation";
import { SheetMatrix } from "@/utils/import/reader";

import { PRODUCT_UNIT_LABELS_QUERY, PRODUCT_UNITS_QUERY } from "./gql";
import { ProductUnitLabelsData, ProductUnitsData } from "./interface";

const CATALOG_INPUT = { variables: { input: { first: 200 } } };

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
  const { data: unitsData } = useQuery<ProductUnitsData>(PRODUCT_UNITS_QUERY, {
    ...CATALOG_INPUT,
    skip: !matrix,
  });
  const { data: labelsData } = useQuery<ProductUnitLabelsData>(
    PRODUCT_UNIT_LABELS_QUERY,
    {
      ...CATALOG_INPUT,
      skip: !matrix,
    }
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

  return {
    unitLabels,
    packLabels,
    unitRecon,
    setUnitFinal,
    packRecon,
    setPackFinal,
  };
}
