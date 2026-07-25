"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { UserDetail } from "../interface";
import { CREATE_SELLER_PROFILE_MUTATION } from "./gql";
import { CreateSellerProfileResponse } from "./interface";
import { REGION_FORM_STEPS } from "./utils";

interface Props {
  user: UserDetail;
  isSelf?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

/**
 * Habilita o perfil de campo de quem já usa o sistema — o caso do proprietário
 * que também vende. Nome e e-mail vão do cadastro que já existe; a pessoa só
 * informa a região. O papel dela NÃO muda: quem é owner continua owner.
 */
export function EnableSellerModal({
  user,
  isSelf,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [createSeller] = useMutation<CreateSellerProfileResponse>(
    CREATE_SELLER_PROFILE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await createSeller({
          variables: {
            input: {
              name: user.name,
              email: user.email,
              region: String(data.region ?? "").trim() || null,
            },
          },
        });

        if (!res.data?.createSeller?.status) {
          throw new Error(
            res.data?.createSeller?.message ?? "Erro ao habilitar o perfil"
          );
        }

        return res.data.createSeller;
      },
      {
        successMessage: "Perfil de vendedor habilitado",
        onSuccess: () => {
          onOpenChange(false);
          formRef.current?.resetForm();
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={
            isSelf ? "Passar a vender em campo" : "Habilitar perfil de vendedor"
          }
          description={
            isSelf
              ? "Você passa a vender em campo, mantendo o acesso que já tem hoje."
              : `${user.name} passa a vender em campo, mantendo o acesso que já tem hoje.`
          }
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Title variant="body-sm" color="muted">
              {isSelf
                ? "Você ganha rotina de visitas, acesso a fábricas e carteira de clientes. O seu nível de acesso no sistema não muda."
                : "A pessoa ganha rotina de visitas, acesso a fábricas e carteira de clientes. O nível de acesso dela no sistema não muda."}
            </Title>

            <FormBuilder
              ref={formRef}
              steps={REGION_FORM_STEPS}
              onSubmit={handleSubmit}
              loading={isLoading}
              unstyled
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Habilitar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
