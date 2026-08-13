"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Copy, ShieldAlert } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { CREATE_PLATFORM_USER_MUTATION } from "../../gql";
import { CreatedPlatformUser } from "../../interface";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface CreateData {
  createPlatformUser: {
    status: boolean;
    message: string;
    data: CreatedPlatformUser | null;
  };
}

/**
 * Cria uma conta de suporte.
 *
 * Duas decisões de tela que vêm da regra do backend:
 *
 * - **Não há escolha de papel.** Esta porta cria SUPPORT e só; Super Admin
 *   continua saindo do comando no servidor. Um seletor com uma opção seria
 *   ruído, e um seletor com duas seria uma promessa que a API recusa.
 * - **O aviso vem ANTES do formulário**, não depois. Quem cria precisa saber no
 *   momento de decidir que está entregando acesso a todas as empresas — inclusive
 *   para entrar como usuário de um cliente.
 *
 * O link aparece uma vez, aqui: não há serviço de e-mail, e é por isso que a
 * mutation o devolve em vez de enviá-lo.
 */
export function NewStaffModal({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<CreatedPlatformUser | null>(null);
  const [mutate] = useMutation<CreateData>(CREATE_PLATFORM_USER_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const { toast } = useToast();

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  const handleCreate = async () => {
    await execute(
      async () => {
        const { data } = await mutate({
          variables: { input: { name: name.trim(), email: email.trim() } },
        });
        const response = data?.createPlatformUser;
        if (!response?.status) {
          throw new Error(response?.message ?? "Falha ao criar a conta.");
        }
        setResult(response.data);
        return response.data;
      },
      { successMessage: "Conta de suporte criada.", onSuccess: onCreated }
    );
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.link);
      toast({
        variant: "success",
        title: "Copiado",
        description: "Link de primeiro acesso copiado.",
      });
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível copiar",
        description: "Selecione o link e copie manualmente.",
      });
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("");
      setEmail("");
      setResult(null);
    }
    onOpenChange(next);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Nova conta de suporte"
          description={
            result
              ? undefined
              : "A pessoa recebe acesso ao console inteiro, acima de todas as empresas."
          }
        />

        <Modal.Body className="flex flex-col gap-12">
          {!result ? (
            <>
              <Alert.Root variant="warning">
                <Alert.Icon icon={ShieldAlert} />
                <Alert.Content>
                  <Alert.Title>Acesso a todos os clientes</Alert.Title>
                  <Alert.Description>
                    Uma conta de suporte enxerga os dados de todas as empresas e
                    pode suspender, trocar plano e entrar como qualquer usuário.
                    Ela não cria nem revoga contas da equipe — isso continua só
                    com você. Use um e-mail da sua equipe, nunca o de um
                    cliente.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>

              <Input.Text
                label="Nome"
                value={name}
                placeholder="Ex.: Ana Souza"
                maxLength={255}
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />

              <Input.Email
                label="E-mail"
                hint="Será o login. A senha não é definida aqui — a pessoa cria a dela pelo link."
                value={email}
                placeholder="ana@suaempresa.com"
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </>
          ) : (
            <>
              <Title variant="body-sm" color="muted">
                Conta criada para <strong>{result.email}</strong>. Copie o link
                de primeiro acesso agora — depois de fechar, só emitindo outro
                pela ficha da pessoa.
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
              onClick={handleCreate}
              loading={isLoading}
              disabled={!canSubmit}
            >
              <Button.Title>Criar conta</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
