"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

interface LinkBoxProps {
  url: string;
  clientName: string;
}

/**
 * A URL recém-emitida, com as duas saídas que o vendedor de fato usa.
 *
 * O aviso não é decorativo: o backend guarda só o hash, então esta é a única
 * vez que o endereço existe em texto. Fechar o modal sem copiar significa
 * emitir outro — e o anterior, que talvez já tenha sido mandado, morre junto.
 */
export function LinkBox({ url, clientName }: LinkBoxProps) {
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

  const whatsappText = encodeURIComponent(
    `Olá! Aqui você acompanha as compras da ${clientName}: ${url}`
  );

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <Title variant="label" color="muted">
          Endereço do portal
        </Title>
        <div className="rounded-(--r-sm) border border-(--border) bg-(--bg3) px-12 py-10">
          <Title variant="body-sm" className="break-all">
            {url}
          </Title>
        </div>
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
