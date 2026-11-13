import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { fileToBase64 } from "@/utils/file";
import { monthStartIso, YearMonth } from "@/utils/format/month";
import { MAX_PDF_ATTACHMENT_BYTES } from "@/utils/pdf/attachment";
import { useMutation } from "@apollo/client/react";

import { commissionsPdfBlob } from "../../pdf";
import { SEND_COMMISSION_STATEMENT_EMAIL_MUTATION } from "./gql";
import { useMonthReport } from "./useMonthReport";

interface SendStatementResponse {
  sendCommissionStatementEmail: { status: boolean; message: string } | null;
}

const TOO_LARGE =
  "O extrato ficou grande demais para ir por email (passa de 3 MB). Baixe o PDF e mande por fora.";

/**
 * Gera o extrato do vendedor (a fatia dele, no ciclo dele) e o manda ao email
 * de login dele, com a resposta voltando para quem apertou. Só o gestor chega
 * aqui — o backend confere de novo (`@is_admin`) e recusa vendedor de outro
 * escritório ou sem email.
 */
export function useSendStatement(
  sellerId: string | null,
  month: YearMonth,
  sellerName: string | null
) {
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();
  const buildReport = useMonthReport(sellerId, month, true);
  const [send] = useMutation<SendStatementResponse>(
    SEND_COMMISSION_STATEMENT_EMAIL_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const sendStatement = () =>
    execute(
      async () => {
        if (!sellerId) throw new Error("Escolha um vendedor antes de enviar.");
        const built = await buildReport("seller");
        // Mês vazio: o aviso já saiu; sem email e sem toast de sucesso.
        if (!built) return null;
        const blob = await commissionsPdfBlob(
          built.report,
          { month, sellerName, companyName, companyLogoUrl },
          built.lens
        );
        if (blob.size > MAX_PDF_ATTACHMENT_BYTES) throw new Error(TOO_LARGE);
        const res = await send({
          variables: {
            input: {
              sellerId,
              month: monthStartIso(month).slice(0, 7),
              pdfBase64: await fileToBase64(blob),
            },
          },
        });
        const result = res.data?.sendCommissionStatementEmail;
        if (!result?.status) {
          throw new Error(
            result?.message ?? "Não foi possível enviar o email."
          );
        }
        return result;
      },
      // Mês vazio devolve null: sem toast de sucesso.
      { successMessage: (r) => r?.message }
    );

  return { sendStatement, isSending: isLoading };
}
