"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { companyInitials } from "@/utils/company";
import { maskCNPJ } from "@/utils/format/masks";
import { MyCompany } from "../../interface";

interface Props {
  company: MyCompany;
}

export function CompanyHeader({ company }: Props) {
  const name = company.nomeFantasia ?? company.razaoSocial;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item>Configurações</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>Dados da empresa</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              Configurações · Dados da empresa
            </PanelHeader.Eyebrow>
            <div className="flex items-center gap-12">
              <Avatar size="lg" color="blue" initials={companyInitials(name)} />
              <div className="flex flex-col">
                <PanelHeader.Title>{name}</PanelHeader.Title>
                <PanelHeader.Description>
                  CNPJ {maskCNPJ(company.cnpj)}
                </PanelHeader.Description>
              </div>
            </div>
            {company.segment && (
              <PanelHeader.Actions className="mt-6">
                <Badge.Root color="blue" appearance="tinted">
                  <Badge.Text>{company.segment}</Badge.Text>
                </Badge.Root>
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
