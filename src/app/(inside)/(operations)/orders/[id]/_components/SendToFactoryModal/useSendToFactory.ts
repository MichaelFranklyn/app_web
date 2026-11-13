import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import { clientName, factoryName } from "@/utils/company";
import { fileToBase64 } from "@/utils/file";
import { MAX_PDF_ATTACHMENT_BYTES } from "@/utils/pdf/attachment";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import {
  MARK_ORDER_SENT_MUTATION,
  ORDER_ITEMS_QUERY,
  SEND_ORDER_TO_FACTORY_EMAIL_MUTATION,
} from "../../gql";
import { OrderDetail, OrderItem, OrderItemsResponse } from "../../interface";
import { exportOrderPdf, orderPdfBlob } from "../../pdf";
import { byCreatedAtAsc } from "../../utils";
import { MarkSentResponse, SendEmailResponse } from "./interface";
import {
  PDF_TOO_LARGE_MESSAGE,
  buildOrderMessage,
  buildWhatsAppUrl,
} from "./utils";

/**
 * As duas portas do "Enviar para a fábrica", com o mesmo PDF e o mesmo carimbo.
 *
 * - **WhatsApp**: baixa o PDF, carimba e SÓ ENTÃO abre a conversa. Carimbar
 *   depois deixaria um pop-up bloqueado como "mandado e não registrado"; o
 *   inverso é visível (a conversa não abriu, a pessoa repete) e o reenvio é
 *   permitido de propósito. O anexo continua manual — o `wa.me` não leva
 *   arquivo, e a tela diz isso.
 * - **Email**: o PDF vai anexado pelo próprio sistema. O backend envia e só
 *   carimba se o envio saiu; a resposta da fábrica vai para quem apertou.
 */
export function useSendToFactory(order: OrderDetail, onDone: () => void) {
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();
  const [fetchItems] = useLazyQuery<OrderItemsResponse>(ORDER_ITEMS_QUERY);
  const [markSent] = useMutation<MarkSentResponse>(MARK_ORDER_SENT_MUTATION);
  const [sendEmail] = useMutation<SendEmailResponse>(
    SEND_ORDER_TO_FACTORY_EMAIL_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();
  const branding = { companyName, companyLogoUrl };
  const isResend = !!order.sentAt;

  const loadItems = async (): Promise<OrderItem[]> => {
    const res = await fetchItems({ variables: { orderId: order.id } });
    if (res.error) throw res.error;
    return (res.data?.orderItems?.edges?.map((e) => e.node) ?? [])
      .slice()
      .sort(byCreatedAtAsc);
  };

  const run = <T extends { message: string }>(action: () => Promise<T>) =>
    execute(action, {
      successMessage: (r) => r?.message ?? "Envio registrado.",
      onSuccess: () => {
        onDone();
        // O carimbo apaga a tarja "não enviado" da lista, e a mutation
        // devolve só o pedido.
        void invalidateClient(ORDER_CACHE_FIELDS);
      },
    });

  const sendViaWhatsApp = (phone: string, note: string) =>
    run(async () => {
      const items = await loadItems();
      await exportOrderPdf(order, items, branding);
      const sent = await markSent({
        variables: {
          id: order.id,
          input: { channel: "WHATSAPP", note: note.trim() || null },
        },
      });
      const result = sent.data?.markOrderSent;
      if (!result?.status) {
        throw new Error(
          result?.message ?? "Não foi possível registrar o envio."
        );
      }
      const message = buildOrderMessage({
        orderCode: order.id.slice(0, 8).toUpperCase(),
        clientName: clientName(order.client) || "Cliente",
        clientCity: order.client?.addressCity,
        clientState: order.client?.addressState,
        factoryName: factoryName(order.factory) || "Fábrica",
        itemCount: items.length,
        totalWithIpi: Number(order.totalAmount) + Number(order.ipiAmount),
        paymentTermLabel: order.paymentTerm?.name ?? null,
        isResend,
      });
      window.open(
        buildWhatsAppUrl(phone, message),
        "_blank",
        "noopener,noreferrer"
      );
      return result;
    });

  const sendViaEmail = (contactId: string, note: string) =>
    run(async () => {
      const { blob } = await orderPdfBlob(order, await loadItems(), branding);
      if (blob.size > MAX_PDF_ATTACHMENT_BYTES)
        throw new Error(PDF_TOO_LARGE_MESSAGE);
      const res = await sendEmail({
        variables: {
          id: order.id,
          input: {
            contactId,
            pdfBase64: await fileToBase64(blob),
            note: note.trim() || null,
          },
        },
      });
      const result = res.data?.sendOrderToFactoryEmail;
      if (!result?.status) {
        throw new Error(result?.message ?? "Não foi possível enviar o email.");
      }
      return result;
    });

  return { sendViaWhatsApp, sendViaEmail, isLoading, isResend };
}
