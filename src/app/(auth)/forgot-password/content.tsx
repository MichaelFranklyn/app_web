"use client";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Responsive } from "@/components/Responsive";
import { RootPage } from "@/components/RootPage";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { ArrowRight, FileWarning, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { REQUEST_PASSWORD_RESET_MUTATION } from "./gql";
import { RequestPasswordResetResponse } from "./interface";

export default function ForgotPasswordContent() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const formRef = useRef<FormBuilderRef>(null);
  const router = useRouter();

  const [requestReset] = useMutation<RequestPasswordResetResponse>(
    REQUEST_PASSWORD_RESET_MUTATION
  );

  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const emailInput = data.email as string;

    await execute(
      async () => {
        const response = await requestReset({
          variables: { input: { email: emailInput } },
        });

        const result = response.data?.requestPasswordReset;

        if (!result?.status) {
          throw new Error(
            result?.message ??
              "Não foi possível solicitar a redefinição de senha."
          );
        }

        return result;
      },
      {
        successMessage: "Link enviado! Verifique sua caixa de entrada.",
        onSuccess: () => {
          setEmail(emailInput);
          setStep(1);
        },
      }
    );
  };

  const handleResend = async () => {
    await execute(
      async () => {
        const response = await requestReset({
          variables: { input: { email } },
        });

        const result = response.data?.requestPasswordReset;

        if (!result?.status) {
          throw new Error(
            result?.message ??
              "Não foi possível reenviar o link de recuperação."
          );
        }

        return result;
      },
      {
        successMessage: `Enviamos um novo link para ${email}.`,
      }
    );
  };

  return (
    <RootPage.Root className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Responsive.Box base="relative flex w-full justify-center flex-col items-center max-w-110">
        <Card.Root className="w-full shadow-(--shadow-md)">
          <Card.Header bg="bg3">
            <Card.Header.Eyebrow>Recuperação de acesso</Card.Header.Eyebrow>
            <Card.Header.Title>Esqueci minha senha</Card.Header.Title>
            <Card.Header.Description>
              Informe seu e-mail para receber as instruções de recuperação
            </Card.Header.Description>
          </Card.Header>

          <Card.Body>
            <Stepper.Root current={step} onChange={setStep}>
              <Stepper.Item label="Identificação">
                <div className="flex flex-col gap-16">
                  <Alert.Root variant="info">
                    <Alert.Icon icon={Info} />
                    <Alert.Content>
                      <Alert.Description>
                        Enviaremos um link de recuperação para o e-mail
                        cadastrado. O link expira em 15 minutos.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>

                  <FormBuilder
                    ref={formRef}
                    onSubmit={handleSubmit}
                    loading={isLoading}
                    unstyled
                    steps={[
                      {
                        id: "forgotPassword",
                        sections: [
                          {
                            id: "credentials",
                            fields: [
                              {
                                name: "email",
                                type: "email",
                                label: "E-mail cadastrado",
                                placeholder: "Informe seu e-mail",
                                required: true,
                              },
                            ],
                          },
                        ],
                      },
                    ]}
                  />

                  <Button.Root
                    type="button"
                    color="amber"
                    appearance="solid"
                    fullWidth
                    loading={isLoading}
                    onClick={() => formRef.current?.submitForm()}
                  >
                    <Button.Title>Enviar instruções</Button.Title>
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
              </Stepper.Item>

              <Stepper.Item label="Confirmação">
                <div className="flex flex-col gap-12">
                  <Badge.Root color="amber" appearance="solid" fullWidth>
                    <Badge.Text>Link enviado com sucesso</Badge.Text>
                  </Badge.Root>

                  <div className="flex flex-col items-center">
                    <Title variant="caption" color="muted">
                      Enviamos as instruções para
                    </Title>
                    <Title variant="caption" weight="extrabold">
                      {email}
                    </Title>
                  </div>

                  <Alert.Root variant="warning">
                    <Alert.Icon icon={FileWarning} />
                    <Alert.Content>
                      <Alert.Description>
                        O link expira em 15 minutos. Verifique também sua pasta
                        de spam.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>

                  <Button.Root
                    type="button"
                    color="amber"
                    appearance="solid"
                    fullWidth
                    loading={isLoading}
                    onClick={handleResend}
                  >
                    <Button.Title>Reenviar link</Button.Title>
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
              </Stepper.Item>
            </Stepper.Root>
          </Card.Body>

          <Card.Footer bg="bg3" className="justify-center">
            <Title
              variant="caption"
              color="muted"
              className="flex w-full items-center justify-center gap-2"
            >
              Não recebeu?
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
