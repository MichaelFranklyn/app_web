"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { RootPage } from "@/components/RootPage";
import { Title } from "@/components/Title";
import { TextLink } from "@/components/TextLink";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { postSession } from "@/utils/auth/session";
import { BrandLogo } from "@/components/BrandLogo";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { SignUpFormData } from "./interface";
import { FORM_STEPS, normalizeInput, validateSignUp } from "./utils";

export default function SignUpContent() {
  const formRef = useRef<FormBuilderRef>(null);
  const router = useRouter();

  const { execute, isLoading } = useAsyncAction();

  const handleSignUp = async (data: Record<string, unknown>) => {
    const formData = data as unknown as SignUpFormData;

    const validationError = validateSignUp(formData);
    if (validationError) {
      // useAsyncAction converte o throw em toast de erro.
      await execute(async () => {
        throw new Error(validationError);
      });
      return;
    }

    await execute(
      // A rota /api/session roda a mutation no servidor e grava o token httpOnly.
      () =>
        postSession(
          { action: "signup", input: normalizeInput(formData) },
          "Não foi possível criar a conta. Verifique os dados e tente novamente."
        ),
      {
        successMessage: "Conta criada! Bem-vindo ao Itinus.",
        onSuccess() {
          router.push("/dashboard");
        },
      }
    );
  };

  return (
    <RootPage.Root className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="flex w-full max-w-[560px] flex-col items-center gap-24">
        <BrandLogo priority className="mx-auto w-[200px]" />

        <Card.Root elevated className="w-[480px] max-w-full">
          <Card.Header bg="bg3">
            <Card.Header.Eyebrow>Teste grátis</Card.Header.Eyebrow>
            <Card.Header.Title>Crie sua conta</Card.Header.Title>
            <Card.Header.Description>
              Cadastre sua empresa e comece a usar em minutos.
            </Card.Header.Description>
          </Card.Header>

          <Card.Body>
            <FormBuilder
              ref={formRef}
              steps={FORM_STEPS}
              onSubmit={handleSignUp}
              loading={isLoading}
              nextLabel="Continuar"
              prevLabel="Voltar"
              submitLabel="Criar conta grátis"
            />

            {/* Os dois documentos precisam estar a um clique de onde a pessoa
                aceita, e não só no rodapé da landing: quem chega direto no
                `/signup` por link nunca passou por lá. */}
            <Title
              variant="micro"
              color="muted"
              className="mt-16 block text-center"
            >
              Ao criar a conta você concorda com os{" "}
              <TextLink href="/termos" tone="inherit" underline="always">
                Termos de uso
              </TextLink>{" "}
              e a{" "}
              <TextLink href="/privacidade" tone="inherit" underline="always">
                Política de privacidade
              </TextLink>
              .
            </Title>
          </Card.Body>

          <Card.Footer bg="bg3">
            <Title
              variant="caption"
              color="muted"
              className="flex w-full items-center justify-center gap-1"
            >
              Já tem conta?
              <Button.Root
                type="button"
                color="amber"
                appearance="ghost"
                size="sm"
                noPadding
                noUppercase
                onClick={() => router.push("/login")}
              >
                <Button.Title>Entrar</Button.Title>
              </Button.Root>
            </Title>
          </Card.Footer>
        </Card.Root>
      </div>
    </RootPage.Root>
  );
}
