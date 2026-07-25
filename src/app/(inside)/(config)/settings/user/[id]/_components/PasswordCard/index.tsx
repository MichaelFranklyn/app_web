"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { DataField, EditCardAction } from "../../../../../_shared/dataCards";

interface Props {
  email: string;
  onChangePassword: () => void;
  /** Âncora do tour guiado — o card é o alvo, não um wrapper em volta dele. */
  dataTour?: string;
}

/**
 * A senha não pode ser exibida, então o card mostra com o que ela entra (o
 * e-mail) e leva ao modal de troca — mesma forma dos outros cards do perfil.
 */
export function PasswordCard({ email, onChangePassword, dataTour }: Props) {
  return (
    <Card.Root className="desktop:col-span-2" data-tour={dataTour}>
      <Card.Header>
        <Card.Header.Title>Senha de acesso</Card.Header.Title>
        <Card.Header.Description>
          É com ela que você entra no sistema. Troque sempre que achar que
          alguém descobriu a sua.
        </Card.Header.Description>
        <Card.Header.Actions>
          <EditCardAction title="Alterar senha" onClick={onChangePassword} />
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <DataField label="Você entra com" value={email} />
          <DataField label="Sua senha" value="••••••••" />
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
