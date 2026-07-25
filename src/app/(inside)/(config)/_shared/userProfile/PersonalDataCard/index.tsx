"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatDateDMY, maskCPF, maskPhoneBR } from "@/utils/format/masks";
import { DataField, EditCardAction } from "../../dataCards";
import { UserDetail } from "../interface";
import { formatAddressLine } from "../utils";

interface Props {
  user: UserDetail;
  /** Próprio perfil: a cópia fala com a pessoa, não sobre ela. */
  isSelf?: boolean;
  /** Sem `onEdit` o card é só leitura (quem não pode editar não vê o botão). */
  onEdit?: () => void;
  /** Âncora do tour guiado — o card é o alvo, não um wrapper em volta dele. */
  dataTour?: string;
}

export function PersonalDataCard({ user, isSelf, onEdit, dataTour }: Props) {
  return (
    <Card.Root data-tour={dataTour}>
      <Card.Header>
        <Card.Header.Title>Dados pessoais</Card.Header.Title>
        <Card.Header.Description>
          {isSelf
            ? "Seu contato e seu endereço. Só você e os gestores da empresa enxergam."
            : "Contato e endereço de quem usa o sistema."}
        </Card.Header.Description>
        {onEdit && (
          <Card.Header.Actions>
            <EditCardAction title="Editar dados pessoais" onClick={onEdit} />
          </Card.Header.Actions>
        )}
      </Card.Header>
      <Card.Body className="flex flex-col gap-16">
        <Grid.Root cols={{ base: 1, desktop: 3 }} gap={16}>
          <DataField label="CPF" value={maskCPF(user.cpf ?? "")} />
          <DataField label="Telefone" value={maskPhoneBR(user.phone ?? "")} />
          <DataField
            label="Nascimento"
            value={formatDateDMY(user.birthDate ?? undefined)}
          />
        </Grid.Root>
        <DataField
          label="Endereço"
          value={formatAddressLine({
            street: user.addressStreet,
            number: user.addressNumber,
            complement: user.addressComplement,
            neighborhood: user.addressNeighborhood,
            city: user.addressCity,
            state: user.addressState,
            zip: user.addressZip,
          })}
        />
      </Card.Body>
    </Card.Root>
  );
}
