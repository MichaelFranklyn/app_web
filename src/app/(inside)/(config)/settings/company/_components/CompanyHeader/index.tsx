"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { PanelHeader } from "@/components/PanelHeader";
import { companyInitials } from "@/utils/company";
import { maskCNPJ } from "@/utils/format/masks";
import { mediaUrl } from "@/utils/media";
import { MyCompany } from "../../interface";

interface Props {
  company: MyCompany;
}

export function CompanyHeader({ company }: Props) {
  const name = company.nomeFantasia ?? company.razaoSocial;

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <div className="flex items-center gap-12">
              {/* O símbolo enviado, quando existe; senão a logo; senão as
                  iniciais. É a mesma ordem do avatar na topbar — a empresa se
                  reconhece pela imagem que ela mesma subiu. */}
              <Avatar
                size="lg"
                color="blue"
                src={mediaUrl(company.avatarUrl ?? company.logoUrl)}
                alt={name}
                initials={companyInitials(name)}
              />
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
