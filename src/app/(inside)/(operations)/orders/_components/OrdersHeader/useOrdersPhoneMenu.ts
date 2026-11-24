"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Sheet, Upload } from "lucide-react";

import type { MoreOptionGroup } from "@/components/MoreOptions";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useFeature } from "@/services/plan";

import { useOrderSheet } from "../../../_components/OrderSheetButton/useOrderSheet";
import { ExportOrdersOptions, useExportOrders } from "./useExportOrders";

type MenuModal = "sheet" | "import";

interface Options extends ExportOrdersOptions {
  /** Gestor abre o modal da ficha; o vendedor baixa a dele direto. */
  canSelectSeller: boolean;
  hasOrders: boolean;
}

/**
 * No celular, o header da lista mostra só "Novo pedido" e um "Mais ações" com
 * Ficha, Exportar e Importar — antes eram quatro botões empilhados na largura
 * toda, empurrando a lista para baixo (crítica de /orders, 23/11/2026).
 *
 * O CSS esconde os botões do desktop desde o primeiro quadro; o menu monta
 * sempre, e os modais só passam a abrir por ele depois que o `useIsPhone`
 * hidrata (antes disso ele ainda não sabe que é celular).
 */
export function useOrdersPhoneMenu({
  canSelectSeller,
  hasOrders,
  ...exportOptions
}: Options) {
  const isPhone = useIsPhone();
  const canImport = useFeature("BULK_IMPORT");
  const { exportSheet, exportPdf } = useExportOrders(exportOptions);
  const { generate } = useOrderSheet();
  const [openModal, setOpenModal] = useState<MenuModal | null>(null);

  const modalProps = (modal: MenuModal) =>
    isPhone
      ? {
          open: openModal === modal,
          onOpenChange: (next: boolean) => setOpenModal(next ? modal : null),
        }
      : {};

  const menu: MoreOptionGroup[] = [
    {
      title: "Pedidos",
      options: [
        {
          label: "Ficha de pedido",
          icon: FileSpreadsheet,
          onClick: () =>
            canSelectSeller ? setOpenModal("sheet") : void generate(),
        },
        ...(canImport
          ? [
              {
                label: "Importar pedido",
                icon: Upload,
                onClick: () => setOpenModal("import"),
              },
            ]
          : []),
      ],
    },
    {
      title: "Exportar a lista",
      options: [
        {
          label: "Exportar planilha (.xlsx)",
          icon: Sheet,
          onClick: () => void exportSheet(),
          disabled: !hasOrders,
        },
        {
          label: "Exportar PDF",
          icon: FileText,
          onClick: () => void exportPdf(),
          disabled: !hasOrders,
        },
      ],
    },
  ];

  return { menu, modalProps };
}
