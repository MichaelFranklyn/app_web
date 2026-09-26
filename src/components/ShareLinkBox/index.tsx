"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { UrlBox } from "@/components/UrlBox";
import { useToast } from "@/components/Toast";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ShareLinkBoxProps {
  url: string;
  /** Rótulo acima do endereço ("Endereço do portal", "Link de resposta"). */
  label: string;
  /** Mensagem do WhatsApp; o endereço é anexado no fim. */
  whatsappMessage: string;
}

/**
 * Link recém-emitido por token (portal do cliente, resposta da rota), com as
 * duas saídas que o vendedor de fato usa: copiar e mandar pelo WhatsApp.
 *
 * O aviso não é decorativo: o backend guarda só o hash, então esta é a única
 * vez que o endereço existe em texto. Fechar o modal sem copiar significa
 * emitir outro — e o anterior, que talvez já tenha sido mandado, morre junto.
 */
export function ShareLinkBox({
  url,
  label,
  whatsappMessage,
}: ShareLinkBoxProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Navegador sem permissão de área de transferência (ou fora de HTTPS):
      // o link continua visível e selecionável na tela acima.
      toast({
        variant: "error",
        title: "Não foi possível copiar",
        description: "Selecione o endereço acima e copie manualmente.",
      });
    }
  };

  const whatsappText = encodeURIComponent(`${whatsappMessage} ${url}`);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <Title variant="label" color="muted">
          {label}
        </Title>
        <UrlBox>{url}</UrlBox>
      </div>

      <div className="flex flex-wrap gap-8">
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          onClick={copy}
        >
          <Button.Icon icon={isCopied ? Check : Copy} />
          <Button.Title>{isCopied ? "Copiado" : "Copiar link"}</Button.Title>
        </Button.Root>

        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
          >
            <Button.Icon icon={MessageCircle} />
            <Button.Title>Enviar pelo WhatsApp</Button.Title>
          </Button.Root>
        </a>
      </div>

      <Alert.Root variant="warning">
        <Alert.Description>
          Guarde este endereço agora — ele não aparece de novo. Se precisar,
          gere outro (o anterior deixa de funcionar).
        </Alert.Description>
      </Alert.Root>
    </div>
  );
}
