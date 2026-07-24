"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { LogoUpload, useLogoUpload } from "@/components/LogoUpload";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { companyInitials } from "@/utils/company";
import { maskCNPJ } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { UPDATE_COMPANY_MUTATION } from "../../gql";
import { MyCompany, UpdateCompanyResponse } from "../../interface";
import { FORM_STEPS, normalizeInput } from "./utils";

interface Props {
  company: MyCompany;
  onSaved: () => void;
}

export function CompanyProfileCard({ company, onSaved }: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const logo = useLogoUpload("logo");
  const avatar = useLogoUpload("avatar");
  const { toast } = useToast();
  const { execute, isLoading } = useAsyncAction();
  const [updateCompany] = useMutation<UpdateCompanyResponse>(
    UPDATE_COMPANY_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = {
      ...normalizeInput(data, company),
      ...(await logo.toLogoInput()),
      ...(await avatar.toLogoInput()),
    };

    // Nada mudou: não vale uma ida ao servidor — mas ficar mudo faz o usuário
    // achar que salvou (ou que o botão está quebrado). Ele precisa saber que
    // não havia o que salvar.
    if (Object.keys(input).length === 0) {
      toast({
        variant: "info",
        title: "Nada para salvar",
        description: "Altere algum dado ou envie uma logo antes de salvar.",
      });
      return;
    }

    await execute(
      async () => {
        const res = await updateCompany({
          variables: { id: company.id, input },
        });
        if (!res.data?.updateCompany?.status || !res.data.updateCompany.data) {
          throw new Error(
            res.data?.updateCompany?.message ?? "Erro ao salvar os dados"
          );
        }
        return res.data.updateCompany.data;
      },
      {
        successMessage: "Dados da empresa atualizados",
        onSuccess: () => {
          logo.reset();
          avatar.reset();
          onSaved();
        },
      }
    );
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Dados da empresa</Card.Header.Title>
        <Card.Header.Description>
          A logo completa vai no PDF que você envia ao cliente; o símbolo
          identifica a empresa no topo do sistema.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body className="flex flex-col gap-20">
        <div className="flex flex-col gap-4">
          <Title variant="heading-sm">{company.razaoSocial}</Title>
          <Title variant="body-sm" color="muted">
            CNPJ {maskCNPJ(company.cnpj)}
            {company.nomeFantasia ? ` · ${company.nomeFantasia}` : ""}
          </Title>
          <Title variant="body-xs" color="muted2">
            Razão social e CNPJ vêm da Receita Federal e não podem ser alterados
            aqui.
          </Title>
        </div>

        {/* Duas imagens porque os usos pedem formatos diferentes: a assinatura
            horizontal some espremida num círculo, e o símbolo sozinho não
            identifica a empresa no cabeçalho de um documento. */}
        <div className="desktop:grid-cols-2 grid gap-20">
          <LogoUpload
            currentUrl={company.logoUrl}
            value={logo.value}
            onChange={logo.onChange}
            initials={companyInitials(
              company.nomeFantasia ?? company.razaoSocial
            )}
            disabled={isLoading}
            label="Logo completa"
            hint="Com o nome da empresa. Aparece no PDF do pedido. PNG, JPG, WEBP ou SVG até 2 MB."
          />
          <LogoUpload
            currentUrl={company.avatarUrl}
            value={avatar.value}
            onChange={avatar.onChange}
            initials={companyInitials(
              company.nomeFantasia ?? company.razaoSocial
            )}
            disabled={isLoading}
            label="Símbolo"
            hint="Imagem quadrada, sem o nome. Aparece no topo do sistema. Sem ela, usamos a logo."
          />
        </div>

        <Divider.Root />

        <FormBuilder
          ref={formRef}
          steps={FORM_STEPS}
          onSubmit={handleSubmit}
          loading={isLoading}
          initialData={{
            segment: company.segment,
            phone: company.phone ?? "",
            whatsapp: company.whatsapp ?? "",
            website: company.website ?? "",
            addressZip: company.addressZip ?? "",
            addressStreet: company.addressStreet ?? "",
            addressNumber: company.addressNumber ?? "",
            addressComplement: company.addressComplement ?? "",
            addressNeighborhood: company.addressNeighborhood ?? "",
            addressCity: company.addressCity ?? "",
            addressState: company.addressState ?? "",
          }}
          unstyled
        />
      </Card.Body>

      <Card.Footer className="justify-end">
        <Button.Root
          type="button"
          appearance="solid"
          color="amber"
          size="md"
          noUppercase
          loading={isLoading}
          onClick={() => formRef.current?.submitForm()}
        >
          <Button.Title>Salvar</Button.Title>
        </Button.Root>
      </Card.Footer>
    </Card.Root>
  );
}
