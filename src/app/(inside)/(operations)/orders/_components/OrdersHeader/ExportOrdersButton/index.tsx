"use client";

import { ExportMenu } from "@/components/ExportMenu";
import type { QueryFilter } from "@/hooks/useTableData";

import { ExportOrdersOptions, useExportOrders } from "../useExportOrders";

/**
 * Filtro no formato que a query espera. É o tipo canônico do `useTableData`,
 * reexportado por compatibilidade com quem já o importava daqui.
 *
 * A cópia local que existia aqui exigia `value: string` e não conhecia
 * `values` — então um filtro `in` (o de várias situações de uma vez, ou o de
 * vocabulário legado) não atravessava a fronteira de tipo, e o arquivo
 * exportado sairia com um recorte diferente do que está na tela.
 */
export type { QueryFilter };

interface Props extends ExportOrdersOptions {
  disabled?: boolean;
}

/** O botão "Exportar" da lista; a varredura e os arquivos ficam no hook. */
export function ExportOrdersButton({ disabled, ...options }: Props) {
  const { exportSheet, exportPdf } = useExportOrders(options);

  return (
    <ExportMenu
      disabled={disabled}
      onExportSheet={exportSheet}
      onExportPdf={exportPdf}
    />
  );
}
