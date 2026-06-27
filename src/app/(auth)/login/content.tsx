"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Input } from "@/components/Input";
import { Responsive } from "@/components/Responsive";
import { RootPage } from "@/components/RootPage";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { setCookie } from "@/utils/cookies/clientCookie";
import { useMutation } from "@apollo/client/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LOGIN_MUTATION } from "./gql";
import { LoginFormData, LoginResponse } from "./interface";
import { FEATURES, STATS } from "./utils";

export default function LoginContent() {
  const [remember, setRemember] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const router = useRouter();

  const [login] = useMutation<LoginResponse>(LOGIN_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleLogin = async (data: Record<string, unknown>) => {
    const formData = data as unknown as LoginFormData;
    const expires = remember ? 30 : undefined;

    await execute(
      async () => {
        const response = await login({
          variables: {
            input: { email: formData.email, password: formData.password },
          },
        });

        const result = response.data?.login;

        if (!result?.status || !result.data) {
          throw new Error(
            result?.message ??
              "Credenciais inválidas. Verifique seu e-mail e senha."
          );
        }
        return result.data;
      },
      {
        successMessage: "Acesso autorizado. Bem-vindo ao Girus.",
        onSuccess(resultData) {
          setCookie("token", resultData.accessToken, { expires });
          setCookie("refresh_token", resultData.refreshToken, { expires });
          setCookie("remember", String(remember), { expires });
          setCookie(
            "userData",
            {
              userId: resultData.userId,
              userName: resultData.userName,
              companyName: resultData.companyName,
              role: resultData.role,
            },
            { expires }
          );

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
          <Image
            src="/horizontal_logo.png"
            alt="Girus"
            width={1059}
            height={247}
            priority
            className="h-auto w-60"
          />

          <Title variant="heading-lg" weight="extrabold" className="uppercase">
            Representação comercial
            <br />
            inteligente
          </Title>

          <Title variant="caption" color="muted" className="leading-[1.6]!">
            Tudo que você precisa para gerenciar sua operação
            <br />
            de representação em um único lugar.
          </Title>

          <Divider.Root className="mb-8" />

          <div className="mb-8 flex gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <Title variant="kpi" color="amber">
                  {value}
                </Title>

                <Title variant="label" color="muted">
                  {label}
                </Title>
              </div>
            ))}
          </div>

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

            <Badge.Root appearance="tinted" color="neutral">
              <Badge.Text>v1.0.0</Badge.Text>
            </Badge.Root>
          </div>
        </Responsive.Show>

        <Responsive.Show from="desktop" display="flex">
          <Divider.Root orientation="vertical" diamond />
        </Responsive.Show>

        <div className="desktop:justify-center flex w-full max-w-95 flex-col gap-8">
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
                  checked={remember}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRemember(e.target.checked)
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
                <Button.Title>Entrar →</Button.Title>
              </Button.Root>
            </Card.Body>

            <Card.Footer bg="bg3">
              <Title
                variant="caption"
                color="muted"
                className="flex w-full items-center justify-center gap-1"
              >
                Novo na plataforma?
                <Button.Root
                  type="button"
                  color="amber"
                  appearance="ghost"
                  size="sm"
                  noPadding
                  noUppercase
                >
                  <Button.Title>Solicitar acesso</Button.Title>
                </Button.Root>
              </Title>
            </Card.Footer>
          </Card.Root>

          <Title variant="caption" color="muted" className="text-center">
            Acesso restrito a representantes autorizados
          </Title>
        </div>
      </Responsive.Box>
    </RootPage.Root>
  );
}
