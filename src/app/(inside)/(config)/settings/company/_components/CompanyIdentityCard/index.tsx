"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { maskCNPJ } from "@/utils/format/masks";
import { DataField, EditCardAction } from "../../../../_shared/dataCards";
import { MyCompany } from "../../interface";

interface Props {
  company: MyCompany;
  onEdit: () => void;
}

export function CompanyIdentityCard({ company, onEdit }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Identificação da empresa</Card.Header.Title>
        <Card.Header.Description>
          Quem a empresa é nos documentos oficiais.
        </Card.Header.Description>
        <Card.Header.Actions>
          <EditCardAction title="Editar segmento" onClick={onEdit} />
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body className="flex flex-col gap-16">
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <DataField label="Razão social" value={company.razaoSocial} />
          <DataField label="CNPJ" value={maskCNPJ(company.cnpj)} />
          <DataField label="Nome fantasia" value={company.nomeFantasia ?? ""} />
          <DataField label="Segmento" value={company.segment} />
        </Grid.Root>

        {/* Vem da Receita Federal: dizer isso evita a pergunta "por que não
            consigo corrigir a razão social?". */}
        <Title variant="body-xs" color="muted2">
          Razão social, CNPJ e nome fantasia vêm da Receita Federal e não podem
          ser alterados aqui. O segmento é seu.
        </Title>
      </Card.Body>
    </Card.Root>
  );
}
