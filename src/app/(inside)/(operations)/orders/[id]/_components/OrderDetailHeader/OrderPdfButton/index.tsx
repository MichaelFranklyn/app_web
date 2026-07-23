"use client";

import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useLazyQuery } from "@apollo/client/react";
import { FileText } from "lucide-react";
import { useState } from "react";
import { ORDER_ITEMS_QUERY } from "../../../gql";
import { OrderDetail, OrderItemsResponse } from "../../../interface";
import { exportOrderPdf } from "../../../pdfExport";
import { byCreatedAtAsc } from "../../../utils";

interface Props {
  order: OrderDetail;
}

/**
 * Gera o PDF do pedido/orçamento para compartilhar com o cliente. Os itens são
 * buscados no clique (cache-first: a tabela já os carregou) e o PDF é montado
 * no navegador com jsPDF, sem tráfego extra para o backend.
 */
export function OrderPdfButton({ order }: Props) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const [fetchItems] = useLazyQuery<OrderItemsResponse>(ORDER_ITEMS_QUERY);

  const handleClick = async () => {
    setBusy(true);
    try {
      const res = await fetchItems({ variables: { orderId: order.id } });
      if (res.error) throw res.error;
      // Mesma ordem da tabela (upload/criação): o PDF do cliente bate com a tela.
      const items = (res.data?.orderItems?.edges?.map((e) => e.node) ?? [])
        .slice()
        .sort(byCreatedAtAsc);
      await exportOrderPdf(order, items);
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível gerar o PDF",
        description: "Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button.Root
      appearance="outline"
      color="neutral"
      size="sm"
      loading={busy}
      onClick={handleClick}
    >
      <Button.Icon icon={FileText} />
      <Button.Title>Gerar PDF</Button.Title>
    </Button.Root>
  );
}
