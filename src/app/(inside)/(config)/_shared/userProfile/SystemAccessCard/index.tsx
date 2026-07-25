"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatDateDMY } from "@/utils/format/masks";
import { DataField } from "../../dataCards";
import { UserDetail } from "../interface";

interface Props {
  user: UserDetail;
  isSelf?: boolean;
}

/**
 * Só leitura nas duas telas: papel e situação são decisão do gestor (o dono do
 * perfil muda o e-mail em "Dados pessoais", nunca o seu próprio acesso).
 */
export function SystemAccessCard({ user, isSelf }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Acesso ao sistema</Card.Header.Title>
        <Card.Header.Description>
          {isSelf
            ? "O que você pode fazer no sistema. Quem define isso é o gestor da empresa."
            : "O que esta pessoa pode fazer e desde quando."}
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <DataField label="E-mail de acesso" value={user.email} />
          <DataField
            label="Situação"
            value={user.isActive ? "Ativo" : "Inativo"}
          />
          <DataField
            label="Empresa"
            value={
              user.company?.nomeFantasia ?? user.company?.razaoSocial ?? ""
            }
          />
          <DataField
            label="Cadastrado em"
            value={formatDateDMY(user.createdAt)}
          />
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
