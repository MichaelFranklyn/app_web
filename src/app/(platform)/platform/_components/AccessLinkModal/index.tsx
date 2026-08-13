"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Copy, Info } from "lucide-react";
import { useState } from "react";
import { ISSUE_ACCESS_LINK_MUTATION } from "./gql";
import { AccessLinkResult, IssueAccessLinkData, LinkTarget } from "./interface";

interface Props {
  /** Nulo fecha a janela — quem abre é quem escolhe a pessoa. */
  user: LinkTarget | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Emite e mostra o link de primeiro acesso.
 *
 * Vive no PAI do console porque duas telas o abrem: a ficha da empresa (pelo
 * card de pessoas) e a ficha da pessoa.
 *
 * O link aparece na TELA para o SU copiar porque não há serviço de e-mail no
 * sistema — é a razão de a mutation devolvê-lo em vez de enviá-lo. Enquanto
 * isso não mudar, esta janela é o único canal de entrega.
 */
export function AccessLinkModal({ user, onOpenChange }: Props) {
  const [result, setResult] = useState<AccessLinkResult | null>(null);
  const [mutate] = useMutation<IssueAccessLinkData>(ISSUE_ACCESS_LINK_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!user) return;
    await execute(
      async () => {
        const { data } = await mutate({ variables: { userId: user.id } });
        const response = data?.issueTenantAccessLink;
        if (!response?.status)
          throw new Error(response?.message ?? "Falha ao gerar o link.");
        setResult(response.data);
        return response.data;
      },
      { successMessage: "Link gerado." }
    );
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.link);
      toast({
        variant: "success",
        title: "Copiado",
        description: "Link de acesso copiado para a área de transferência.",
      });
    } catch {
      // Clipboard bloqueado (contexto inseguro, permissão negada): o link está
      // na tela, então dizer o que fazer é melhor que engolir o erro.
      toast({
        variant: "error",
        title: "Não foi possível copiar",
        description: "Selecione o link e copie manualmente.",
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) setResult(null);
    onOpenChange(open);
  };

  return (
    <Modal.Root open={!!user} onOpenChange={handleClose}>
      <Modal.Content size="md">
        <Modal.Header
          title="Liberar acesso"
          description={
            user
              ? `Gera um link para ${user.name} definir a própria senha.`
              : undefined
          }
        />

        <Modal.Body className="flex flex-col gap-12">
          {!result ? (
            <>
              <Title variant="body-sm" color="muted">
                Emitir um link novo <strong>invalida os anteriores</strong>{" "}
                desta pessoa. O link vale por 15 minutos.
              </Title>
              <Alert.Root variant="info">
                <Alert.Icon icon={Info} />
                <Alert.Content>
                  <Alert.Description>
                    O sistema não envia e-mails. Você vai copiar o link aqui e
                    repassar por outro canal.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </>
          ) : (
            <>
              <Title variant="body-sm" color="muted">
                Link para <strong>{result.userEmail}</strong>. Copie agora —
                depois de fechar, só emitindo outro.
              </Title>
              <div className="rounded-md border border-(--border) bg-(--bg3) p-12 break-all">
                <Title variant="micro">{result.link}</Title>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="ghost" disabled={isLoading}>
              <Button.Title>{result ? "Fechar" : "Cancelar"}</Button.Title>
            </Button.Root>
          </Modal.Close>
          {result ? (
            <Button.Root appearance="solid" color="amber" onClick={handleCopy}>
              <Button.Icon icon={Copy} />
              <Button.Title>Copiar link</Button.Title>
            </Button.Root>
          ) : (
            <Button.Root
              appearance="solid"
              color="amber"
              onClick={handleGenerate}
              loading={isLoading}
            >
              <Button.Title>Gerar link</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
