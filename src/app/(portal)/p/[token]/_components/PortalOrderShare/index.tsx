"use client";

import { Button } from "@/components/Button";
import { Share } from "@/components/Share";
import { Download } from "lucide-react";
import { useState } from "react";

export interface PortalOrderShareSeller {
  sellerName: string | null;
  sellerEmail: string | null;
  sellerPhone: string | null;
}

interface PortalOrderShareProps {
  seller: PortalOrderShareSeller;
  /** Gera e baixa o PDF; se rejeitar, o botão avisa e convida a tentar de novo. */
  onDownloadPdf: () => Promise<void>;
  subject: string;
  /** O resumo pronto, o mesmo no email e no WhatsApp. */
  message: string;
}

/**
 * As ações do cabeçalho de um pedido do portal (feito ou enviado): o PDF para
 * guardar ou imprimir, e o resumo pronto no email ou no WhatsApp do
 * representante — com a prévia (`Share`) antes de abrir o aplicativo do
 * aparelho. Ficam soltas (sem card) para entrar no `PanelHeader.Actions`, que
 * empilha no celular.
 *
 * Se o PDF falhar, o próprio botão diz isso e convida a tentar de novo — um
 * aviso solto empurraria as ações para fora da linha do cabeçalho.
 */
export function PortalOrderShare({
  seller,
  onDownloadPdf,
  subject,
  message,
}: PortalOrderShareProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);

  const downloadPdf = async () => {
    setIsGenerating(true);
    setPdfFailed(false);
    try {
      await onDownloadPdf();
    } catch {
      setPdfFailed(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button.Root
        type="button"
        appearance="outline"
        color={pdfFailed ? "red" : "neutral"}
        loading={isGenerating}
        onClick={() => void downloadPdf()}
      >
        <Button.Icon icon={Download} />
        <Button.Title>
          {pdfFailed ? "Tentar o PDF de novo" : "Baixar PDF"}
        </Button.Title>
      </Button.Root>
      {pdfFailed ? (
        <span role="alert" className="sr-only">
          Não foi possível gerar o PDF. Tente de novo.
        </span>
      ) : null}
      {seller.sellerEmail ? (
        <Share.Email
          to={seller.sellerEmail}
          toName={seller.sellerName}
          subject={subject}
          body={message}
          title="Enviar o pedido por email"
          description="Veja como o email chega ao seu representante."
        />
      ) : null}
      <Share.Whatsapp
        phone={seller.sellerPhone}
        toName={seller.sellerName}
        message={message}
        title="Enviar o pedido pelo WhatsApp"
        description="Veja como a mensagem chega ao seu representante."
      />
    </>
  );
}
