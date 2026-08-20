"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Input } from "@/components/Input";
import { Responsive } from "@/components/Responsive";
import { RootPage } from "@/components/RootPage";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { postSession } from "@/utils/auth/session";
import { TRIAL_DAYS } from "@/utils/trial";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoginFormData } from "./interface";
import { FEATURES, HEADLINE, SUBTITLE } from "./utils";

export default function LoginContent() {
  const [shouldRemember, setShouldRemember] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const router = useRouter();

  const { execute, isLoading } = useAsyncAction();

  const handleLogin = async (data: Record<string, unknown>) => {
    const formData = data as unknown as LoginFormData;

    await execute(
      // A sessão é estabelecida pela rota /api/session: ela roda a mutation no
      // servidor e grava o token httpOnly. O token nunca chega ao JS.
      () =>
        postSession(
          {
            action: "login",
            input: { email: formData.email, password: formData.password },
            remember: shouldRemember,
          },
          "Credenciais inválidas. Verifique seu e-mail e senha."
        ),
      {
        successMessage: "Acesso autorizado. Bem-vindo ao Girus.",
        onSuccess() {
          router.push("/dashboard");
        },
      }
    );
  };

  return (
    <RootPage.Root className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Responsive.Box
        base="relative flex w-full flex-col items-center gap-8"
        desktop="desktop:w-auto desktop:flex-row desktop:items-stretch desktop:gap-24"
      >
        <Responsive.Show
          from="desktop"
          display="flex"
          className="w-120 flex-col items-start justify-center gap-8"
        >
          {/* A marca leva à vitrine: quem cai aqui por link direto e ainda
              não conhece o sistema precisa de um caminho de volta. */}
          <Link href="/" aria-label="Conhecer o Girus">
            <Image
              src="/horizontal_logo.png"
              alt="Girus"
              width={1059}
              height={247}
              priority
              className="h-auto w-60"
            />
          </Link>

          <Title
            variant="heading-lg"
            weight="extrabold"
            className="pt-8 text-[32px]! uppercase"
          >
            {HEADLINE.lead}
            <br />
            <span className="text-(--amber)">{HEADLINE.highlight}</span>
          </Title>

          <Title variant="caption" color="muted" className="leading-[1.6]!">
            {SUBTITLE}
          </Title>

          <Divider.Root className="mb-8" />

          <div className="flex flex-col gap-12">
            {FEATURES.map((text, i) => (
              <div key={i} className="flex items-start gap-4">
                <Title variant="caption" color="amber">
                  {String(i + 1).padStart(2, "0")}
                </Title>
                <Title variant="caption" color="muted">
                  {text}
                </Title>
              </div>
            ))}
          </div>
        </Responsive.Show>

        <Responsive.Show from="desktop" display="flex">
          <Divider.Root orientation="vertical" diamond />
        </Responsive.Show>

        <div className="desktop:justify-center flex w-full max-w-95 flex-col gap-8">
          {/* No celular o painel da esquerda não existe, e sem isto a tela de
              entrada ficava sem marca nenhuma — justamente onde o vendedor
              entra todo dia. */}
          <Responsive.Hide from="desktop" className="flex justify-center">
            <Link href="/" aria-label="Conhecer o Girus">
              <Image
                src="/horizontal_logo.png"
                alt="Girus"
                width={1059}
                height={247}
                priority
                className="h-auto w-[180px]"
              />
            </Link>
          </Responsive.Hide>

          <Card.Root className="w-full shadow-(--shadow-md)">
            <Card.Header bg="bg3">
              <Card.Header.Eyebrow>Autenticação</Card.Header.Eyebrow>
              <Card.Header.Title>Bem-vindo de volta</Card.Header.Title>
              <Card.Header.Description>
                Acesse sua conta para continuar
              </Card.Header.Description>
            </Card.Header>

            <Card.Body>
              <FormBuilder
                ref={formRef}
                onSubmit={handleLogin}
                loading={isLoading}
                unstyled
                steps={[
                  {
                    id: "login",
                    sections: [
                      {
                        id: "credentials",
                        fields: [
                          {
                            name: "email",
                            type: "email",
                            label: "E-mail",
                            placeholder: "voce@empresa.com.br",
                            required: true,
                          },
                          {
                            name: "password",
                            type: "password",
                            label: "Senha",
                            placeholder: "••••••••",
                            required: true,
                          },
                        ],
                      },
                    ],
                  },
                ]}
              />

              <div className="flex items-center justify-between">
                <Input.Checkbox
                  label="Lembrar por 30 dias"
                  checked={shouldRemember}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setShouldRemember(e.target.checked)
                  }
                />
                <Button.Root
                  type="button"
                  color="amber"
                  appearance="ghost"
                  size="sm"
                  noUppercase
                  noPadding
                  onClick={() => router.push("/forgot-password")}
                >
                  <Button.Title>Esqueci a senha</Button.Title>
                </Button.Root>
              </div>

              <Button.Root
                type="button"
                color="amber"
                appearance="solid"
                fullWidth
                loading={isLoading}
                onClick={() => formRef.current?.submitForm()}
              >
                <Button.Title>Entrar</Button.Title>
                <Button.Icon icon={ArrowRight} />
              </Button.Root>
            </Card.Body>
          </Card.Root>

          {/* O mesmo compromisso da landing, com o número que o backend grava
              em `trial_ends_at` — e não um "teste grátis" solto. O link de volta
              à vitrine aparece aqui porque no celular o painel não existe. */}
          <Title
            variant="caption"
            color="muted"
            className="flex flex-wrap items-center justify-center gap-6 text-center"
          >
            <span>{TRIAL_DAYS} dias grátis · sem cartão</span>
            <span aria-hidden>·</span>
            <Link href="/" className="text-(--amber) hover:underline">
              Conhecer o Girus
            </Link>
          </Title>
        </div>
      </Responsive.Box>
    </RootPage.Root>
  );
}
