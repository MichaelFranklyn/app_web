"use client";

import { Card } from "@/components/Card";
import { DataField, EditCardAction } from "../../../../_shared/dataCards";
import { MyCompany } from "../../interface";
import { formatCompanyAddress } from "../../utils";

interface Props {
  company: MyCompany;
  onEdit: () => void;
}

export function CompanyAddressCard({ company, onEdit }: Props) {
  return (
    <Card.Root className="desktop:col-span-2">
      <Card.Header>
        <Card.Header.Title>Endereço</Card.Header.Title>
        <Card.Header.Description>
          Aparece nos documentos que você envia ao cliente.
        </Card.Header.Description>
        <Card.Header.Actions>
          <EditCardAction title="Editar endereço" onClick={onEdit} />
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body>
        <DataField label="Endereço" value={formatCompanyAddress(company)} />
      </Card.Body>
    </Card.Root>
  );
}
