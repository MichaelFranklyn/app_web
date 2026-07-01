"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Dot } from "@/components/Dot";
import { InputPassword } from "@/components/Input";
import { Responsive } from "@/components/Responsive";
import { RootPage } from "@/components/RootPage";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { setCookie } from "@/utils/cookies/clientCookie";
import { useMutation } from "@apollo/client/react";
import { ArrowRight, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { RESET_PASSWORD_MUTATION } from "./gql";
import { ResetPasswordResponse } from "./interface";
import { RULES } from "./utils";

// useSearchParams exige Suspense no prerender estático (build de produção).
export default function ChangePasswordContent() {
  return (
    <Suspense>
      <ChangePasswordForm />
    </Suspense>
  );
}

function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [resetPassword] = useMutation<ResetPasswordResponse>(
    RESET_PASSWORD_MUTATION
  );

  const { execute, isLoading } = useAsyncAction();

  const allRulesMet = RULES.every(({ test }) => test(password));
  const passwordsMatch = password === confirm;
  const confirmError = touched && confirm.length > 0 && !passwordsMatch;
  const tokenMissing = !token;

  const handleSubmit = async () => {
    setTouched(true);
    if (!allRulesMet || !passwordsMatch || confirm.length === 0) return;
    if (tokenMissing) return;

    await execute(
      async () => {
        const response = await resetPassword({
          variables: { input: { token, newPassword: password } },
        });

        const result = response.data?.resetPassword;

        if (!result?.status || !result.data) {
          throw new Error(
            result?.message ??
              "Não foi possível redefinir sua senha. Tente novamente."
          );
        }

        return result.data;
      },
      {
        successMessage: "Sua senha foi redefinida. Bem-vindo de volta.",
        onSuccess: (data) => {
          const { accessToken, refreshToken, userName, companyName, role } =
            data;

          setCookie("token", accessToken);
          setCookie("refresh_token", refreshToken);
          setCookie("userData", { userName, companyName, role });

          router.push("/dashboard");
        },
      }
    );
  };

  return (
    <RootPage.Root className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Responsive.Box base="relative flex w-full justify-center flex-col items-center max-w-110">
        <Card.Root className="w-full shadow-(--shadow-md)">
          <Card.Header bg="bg3">
            <Card.Header.Eyebrow>Recuperação de acesso</Card.Header.Eyebrow>
            <Card.Header.Title>Redefinir senha</Card.Header.Title>
            <Card.Header.Description>
              Crie uma nova senha segura para sua conta
            </Card.Header.Description>
          </Card.Header>

          <Card.Body>
            <div className="flex flex-col gap-16">
              {tokenMissing && (
                <Alert.Root variant="error">
                  <Alert.Icon icon={X} />
                  <Alert.Content>
                    <Alert.Title>Link inválido</Alert.Title>
                    <Alert.Description>
                      Nenhum token de recuperação foi fornecido. Solicite um
                      novo link em &quot;Esqueci a senha&quot;.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <div className="flex flex-col gap-8">
                <InputPassword
                  label="Nova senha"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={tokenMissing}
                />

                <div className="flex flex-col gap-4">
                  {RULES.map(({ label, test }) => {
                    const met = test(password);
                    return (
                      <div key={label} className="flex items-center gap-6">
                        <Dot.Root
                          color={met ? "green" : "neutral"}
                          pulse={false}
                          className={met ? "opacity-100" : "opacity-40"}
                        />
                        <Title
                          variant="caption"
                          color={met ? "green" : "muted"}
                        >
                          {label}
                        </Title>
                      </div>
                    );
                  })}
                </div>
              </div>

              <InputPassword
                label="Confirmar senha"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched(true)}
                error={confirmError ? "As senhas não coincidem" : undefined}
                disabled={tokenMissing}
              />

              <Button.Root
                type="button"
                color="amber"
                appearance="solid"
                fullWidth
                loading={isLoading}
                disabled={tokenMissing}
                onClick={handleSubmit}
              >
                <Button.Title>Redefinir senha</Button.Title>
                <Button.Icon icon={ArrowRight} />
              </Button.Root>

              <Button.Root
                type="button"
                color="neutral"
                appearance="outline"
                fullWidth
                onClick={() => router.push("/login")}
              >
                <Button.Title>Voltar ao login</Button.Title>
              </Button.Root>
            </div>
          </Card.Body>

          <Card.Footer bg="bg3" className="justify-center">
            <Title
              variant="caption"
              color="muted"
              className="flex w-full items-center justify-center gap-2"
            >
              Precisa de ajuda?
              <Button.Root
                type="button"
                color="amber"
                appearance="ghost"
                size="sm"
                noPadding
                noUppercase
              >
                <Button.Title>suporte@girus.com.br</Button.Title>
              </Button.Root>
            </Title>
          </Card.Footer>
        </Card.Root>
      </Responsive.Box>
    </RootPage.Root>
  );
}
