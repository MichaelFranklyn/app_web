"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { maskPhoneBR } from "@/utils/format/masks";
import { EditCardAction } from "../../../../_shared/dataCards";
import { MyCompany } from "../../interface";

interface Props {
  company: MyCompany;
  onEdit: () => void;
}

export function CompanyContactCard({ company, onEdit }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Contato</Card.Header.Title>
        <Card.Header.Description>
          Como o cliente fala com a sua empresa. Sai no PDF do pedido.
        </Card.Header.Description>
        <Card.Header.Actions>
          <EditCardAction title="Editar contato" onClick={onEdit} />
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body>
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <Card.Field
            label="Telefone"
            value={maskPhoneBR(company.phone ?? "")}
          />
          <Card.Field
            label="WhatsApp"
            value={maskPhoneBR(company.whatsapp ?? "")}
          />
          <Card.Field label="Site" value={company.website ?? ""} />
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
