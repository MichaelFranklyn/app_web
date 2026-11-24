"use client";

import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { useLazyQuery } from "@apollo/client/react";
import { ORDER_ITEMS_QUERY } from "../../gql";
import { OrderDetail, OrderItem, OrderItemsResponse } from "../../interface";
import { exportOrderPdf } from "../../pdf";
import { exportOrderSheet } from "../../sheet";
import { byCreatedAtAsc } from "../../utils";

/**
 * As três saídas do pedido (planilha, PDF, PDF com fotos). Servem ao botão
 * "Exportar" e aos itens do "Mais ações" no celular — o mesmo arquivo pelos
 * dois caminhos.
 *
 * Os itens são buscados no clique (cache-first: a tabela já os carregou) e o
 * arquivo é montado no navegador com jsPDF/SheetJS, sem tráfego extra para o
 * backend.
 */
export function useOrderExport(order: OrderDetail) {
  const { toast } = useToast();
  const [fetchItems] = useLazyQuery<OrderItemsResponse>(ORDER_ITEMS_QUERY);
  // Logo e nome da representação no cabeçalho do documento que vai ao cliente.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  const runExport = async (write: (items: OrderItem[]) => Promise<void>) => {
    try {
      const res = await fetchItems({ variables: { orderId: order.id } });
      if (res.error) throw res.error;
      // Mesma ordem da tabela (upload/criação): o arquivo bate com a tela.
      const items = (res.data?.orderItems?.edges?.map((e) => e.node) ?? [])
        .slice()
        .sort(byCreatedAtAsc);
      await write(items);
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível exportar",
        description: "Tente novamente.",
      });
    }
  };

  return {
    exportSheet: () => runExport((items) => exportOrderSheet(order, items)),
    exportPdf: () =>
      runExport((items) =>
        exportOrderPdf(order, items, { companyName, companyLogoUrl })
      ),
    exportPdfWithPhotos: () =>
      runExport((items) =>
        exportOrderPdf(order, items, {
          companyName,
          companyLogoUrl,
          withPhotos: true,
        })
      ),
  };
}
