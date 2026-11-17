import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { TRIAL_DAYS } from "../../../plans";

/**
 * Quem tenta assinar sem estar logado. A assinatura vale para uma EMPRESA, e
 * a cobrança sai no nome e no CNPJ da conta — sem login não há em nome de quem
 * cobrar.
 *
 * O login não volta para cá sozinho, então o texto diz onde o botão de assinar
 * mora dentro do sistema.
 */
export function SignInNotice({ onBack }: { onBack: () => void }) {
  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={LogIn} />

      <Alert.Content>
        <Alert.Title>Entre na sua conta para assinar</Alert.Title>

        <Alert.Description>
          A assinatura fica no nome da sua empresa. Entre com a conta do
          responsável e, no sistema, vá em Configurações › Plano e toque em
          Assinar.
        </Alert.Description>

        <Alert.Description>
          Ainda não tem conta? Crie uma e use {TRIAL_DAYS} dias grátis, sem
          cartão.
        </Alert.Description>

        {/* Três botões não cabem na coluna de ações à direita do aviso: ficam
            embaixo do texto, quebrando linha no celular. */}
        <div className="flex flex-wrap gap-8 pt-8">
          <Link href="/login">
            <Button.Root color="amber">
              <Button.Title>Entrar</Button.Title>
            </Button.Root>
          </Link>

          <Link href="/signup">
            <Button.Root appearance="ghost">
              <Button.Title>Criar conta</Button.Title>
            </Button.Root>
          </Link>

          <Button.Root appearance="ghost" onClick={onBack}>
            <Button.Title>Voltar</Button.Title>
          </Button.Root>
        </div>
      </Alert.Content>
    </Alert.Root>
  );
}
