"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { maskCNPJ } from "@/utils/format/masks";
import { CompanyFactoryDetail } from "../../interface";
import { isContractExpired } from "../../../utils";
import { DeleteCompanyFactoryModal } from "./DeleteCompanyFactoryModal";
import { EditCompanyFactoryModal } from "./EditCompanyFactoryModal";

interface Props {
  companyFactory: CompanyFactoryDetail;
}

export function FactoryPageHeader({ companyFactory }: Props) {
  const { factory } = companyFactory;
  const name = factory.nomeFantasia ?? factory.razaoSocial;
  const city = [factory.addressCity, factory.addressState]
    .filter(Boolean)
    .join(" / ");
  const isActive = !factory.deletedAt;

  const isExpired = isContractExpired(companyFactory.contractEnd);

  return (
    <div className="flex flex-col gap-12">
      <Breadcrumb.Root>
        <Breadcrumb.Item href="/factories">Fábricas</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>{name}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              02 — Fábricas
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>
              {name}
            </PanelHeader.Title>
            <PanelHeader.Description>
              {city} · CNPJ {maskCNPJ(factory.cnpj)}
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6">
              <Badge.Root
                color={isActive ? "green" : "red"}
                appearance="tinted"
                size="sm"
              >
                <Badge.Text>{isActive ? "Ativa" : "Inativa"}</Badge.Text>
              </Badge.Root>

              {isExpired && (
                <Badge.Root color="red" appearance="solid" size="sm">
                  <Badge.Text>Contrato expirado</Badge.Text>
                </Badge.Root>
              )}

              <EditCompanyFactoryModal />

              <DeleteCompanyFactoryModal
                companyFactoryId={companyFactory.id}
                factoryName={name}
              />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
