"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { formatDateDMY } from "@/utils/format/masks";
import { CompanyFactoryDetail } from "../../../interface";
import { getContractStatus } from "../../../../utils";

interface Props {
  companyFactory: CompanyFactoryDetail;
}

export function ContractCard({ companyFactory }: Props) {
  const contract = getContractStatus(companyFactory.contractEnd);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          <span className="inline-flex items-center gap-6">
            Contrato
            <HelpTooltip
              label="O que é o contrato?"
              content={
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Contrato de representação
                  </Title>
                  <Title variant="body-sm">
                    Período em que a sua empresa pode vender por esta fábrica.
                    Quando a data de término passa, a página mostra o aviso
                    &quot;Contrato expirado&quot;.
                  </Title>
                  <Title variant="body-sm" color="muted">
                    Renovou com a fábrica? Atualize as datas pelo botão Editar
                    no topo da página.
                  </Title>
                </div>
              }
            />
          </span>
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        <Card.Item variant="stat">
          <Card.Item.Label>Situação</Card.Item.Label>
          <Card.Item.Value color={contract.color}>{contract.label}</Card.Item.Value>
        </Card.Item>
        {companyFactory.contractStart && (
          <Card.Item variant="stat">
            <Card.Item.Label>Início</Card.Item.Label>
            <Card.Item.Value>
              {formatDateDMY(companyFactory.contractStart)}
            </Card.Item.Value>
          </Card.Item>
        )}
        {companyFactory.contractEnd && (
          <Card.Item variant="stat" bordered={false}>
            <Card.Item.Label>Término</Card.Item.Label>
            <Card.Item.Value>
              {formatDateDMY(companyFactory.contractEnd)}
            </Card.Item.Value>
          </Card.Item>
        )}
      </Card.Body>
    </Card.Root>
  );
}
