"use client";

import { DocumentNumber } from "@/components/DocumentNumber";
import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { Avatar } from "@/components/Avatar";
import { factoryName } from "@/utils/company";
import { mediaUrl } from "@/utils/media";
import { CompanyFactoryDetail } from "../../interface";
import { isContractExpired } from "../../../utils";
import { ApplyCommissionRateModal } from "../ApplyCommissionRateModal";
import { EditCompanyFactoryModal } from "./EditCompanyFactoryModal";
import { FactoryMoreMenu } from "./FactoryMoreMenu";

interface Props {
  companyFactory: CompanyFactoryDetail;
}

export function FactoryPageHeader({ companyFactory }: Props) {
  const { factory } = companyFactory;
  const name = factoryName(factory);
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
            {/* Logo ao lado do bloco nome + cidade/CNPJ, e não só do nome:
                antes o nome ficava sozinho ao lado do círculo de 72px e a
                linha de baixo voltava para a margem, por baixo do logo — no
                celular parecia um título solto e um texto desalinhado
                (relato de 23/11/2026). */}
            <div className="flex items-center gap-12">
              <Avatar
                size="lg"
                color="amber"
                src={mediaUrl(factory.logoUrl)}
                alt={name}
                initials={name.slice(0, 2).toUpperCase()}
                className="shrink-0"
              />
              <div className="min-w-0">
                <PanelHeader.Title>{name}</PanelHeader.Title>
                <PanelHeader.Description>
                  {city} · CNPJ <DocumentNumber value={factory.cnpj} />
                </PanelHeader.Description>
              </div>
            </div>
            {/* Tarjas e ações na faixa padrão (PanelHeader.Tags). */}
            <PanelHeader.Tags>
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

              <PanelHeader.Actions data-tour="factory-detail-actions">
                <EditCompanyFactoryModal />
                <FactoryMoreMenu
                  companyFactoryId={companyFactory.id}
                  factoryName={name}
                />
              </PanelHeader.Actions>
            </PanelHeader.Tags>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* Montado uma vez, aqui: ele é aberto de duas portas (o botão ao lado da
          comissão, na Visão geral, e o salvamento de uma taxa diferente, de
          qualquer aba) e o cabeçalho é a única parte da página que está sempre
          na tela. Sem gatilho próprio — quem abre é o contexto. */}
      <ApplyCommissionRateModal />
    </div>
  );
}
