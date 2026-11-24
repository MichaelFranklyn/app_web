"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { DataField, EditCardAction } from "../../../../_shared/dataCards";
import { MyCompany } from "../../interface";
import { formatCompanyAddress } from "../../utils";

interface Props {
  company: MyCompany;
  onEdit: () => void;
}

/** O que falta para o endereço sair completo no PDF. */
function missingAddressParts(company: MyCompany): string[] {
  const missing: string[] = [];
  if (!company.addressStreet) missing.push("a rua");
  if (!company.addressNumber) missing.push("o número");
  if (!company.addressZip) missing.push("o CEP");
  return missing;
}

function joinParts(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

export function CompanyAddressCard({ company, onEdit }: Props) {
  // Só "Salvador - BA" parecia endereço completo: diz o que falta
  // (crítica de configurações, 23/11/2026).
  const missing = missingAddressParts(company);

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
        <div className="flex flex-col gap-8">
          <DataField label="Endereço" value={formatCompanyAddress(company)} />
          {missing.length > 0 && (
            <Title variant="body-sm" color="muted">
              Falta {joinParts(missing)} — complete em &quot;Editar
              endereço&quot; para o endereço sair inteiro nos documentos.
            </Title>
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
