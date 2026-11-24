"use client";

import { ExportMenu } from "@/components/ExportMenu";
import { Images } from "lucide-react";
import { OrderDetail } from "../../../interface";
import { useOrderExport } from "../useOrderExport";

interface Props {
  order: OrderDetail;
}

/**
 * Exporta o pedido/orçamento: PDF para mandar ao cliente e planilha para quem
 * precisa conferir e somar os itens (o comprador da loja, o financeiro).
 */
export function OrderExportMenu({ order }: Props) {
  const { exportSheet, exportPdf, exportPdfWithPhotos } = useOrderExport(order);

  return (
    <ExportMenu
      onExportSheet={exportSheet}
      onExportPdf={exportPdf}
      extraActions={[
        {
          // Saída à parte, e não uma opção do PDF normal: as fotos engordam o
          // arquivo e a geração demora, então quem escolhe está escolhendo isso.
          label: "PDF com fotos",
          icon: Images,
          onSelect: exportPdfWithPhotos,
        },
      ]}
    />
  );
}
