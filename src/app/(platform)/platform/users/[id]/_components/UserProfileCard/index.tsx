"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { PanelHeader } from "@/components/PanelHeader";
import { Title } from "@/components/Title";
import { Building2, KeyRound, LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccessLinkModal } from "../../../../_components/AccessLinkModal";
import { useImpersonate } from "../../../../useImpersonate";
import {
  ROLE_LABEL,
  activityLabel,
  activityTone,
  daysSinceLogin,
} from "../../../../utils";
import { PlatformUserDetail } from "../../interface";

const TONE_COLOR = {
  ok: "green",
  atencao: "amber",
  urgente: "red",
  neutral: "muted",
} as const;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
};

/**
 * Quem é a pessoa e o que o suporte pode fazer por ela.
 *
 * As duas ações são as mesmas da ficha da empresa, e é de propósito: o chamado
 * chega ora pela empresa ("ninguém da tal empresa entra"), ora pela pessoa
 * ("fulano perdeu a senha"), e obrigar a passar pela empresa para agir sobre
 * uma pessoa é um desvio sem motivo.
 */
export function UserProfileCard({ user }: { user: PlatformUserDetail }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const { impersonate, impersonating } = useImpersonate();

  const days = daysSinceLogin(user.lastLoginAt);

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--purple)">
              Console · Pessoa
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>{user.name}</PanelHeader.Title>
            <PanelHeader.Description>{user.email}</PanelHeader.Description>

            <PanelHeader.Actions>
              <Button.Root
                appearance="solid"
                color="neutral"
                onClick={() => setLinkOpen(true)}
              >
                <Button.Icon icon={KeyRound} />
                <Button.Title>Liberar acesso</Button.Title>
              </Button.Root>
              <Button.Root
                appearance="outline"
                color="neutral"
                onClick={() => impersonate(user.id)}
                loading={impersonating === user.id}
              >
                <Button.Icon icon={LogIn} />
                <Button.Title>Entrar como</Button.Title>
              </Button.Root>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        <Grid.Item>
          <Card.Kpi>
            <Card.Kpi.Label>Empresa</Card.Kpi.Label>
            <Card.Kpi.Value status="neutral" className="text-[16px]!">
              {user.companyName}
            </Card.Kpi.Value>
            <Card.Kpi.Delta>
              <Link
                href={`/platform/companies/${user.companyId}`}
                className="inline-flex items-center gap-4 underline underline-offset-2"
              >
                <Building2 size={12} />
                abrir a ficha
              </Link>
            </Card.Kpi.Delta>
          </Card.Kpi>
        </Grid.Item>

        <Grid.Item>
          <Card.Kpi>
            <Card.Kpi.Label>Papel</Card.Kpi.Label>
            <Card.Kpi.Value status="neutral" className="text-[16px]!">
              {ROLE_LABEL[user.role] ?? user.role}
            </Card.Kpi.Value>
            <Card.Kpi.Delta>define o que ela enxerga</Card.Kpi.Delta>
          </Card.Kpi>
        </Grid.Item>

        <Grid.Item>
          <Card.Kpi>
            <Card.Kpi.Label>Último acesso</Card.Kpi.Label>
            {/* "Nunca entrou" não é "entrou há muito tempo": uma é conta que
                nunca começou, a outra é conta abandonada. */}
            <Card.Kpi.Value
              status={days === null ? "atencao" : days <= 30 ? "ok" : "atencao"}
              className="text-[16px]!"
            >
              {activityLabel(days)}
            </Card.Kpi.Value>
            <Card.Kpi.Delta>
              <Title variant="micro" color={TONE_COLOR[activityTone(days)]}>
                conta criada em {formatDate(user.createdAt)}
              </Title>
            </Card.Kpi.Delta>
          </Card.Kpi>
        </Grid.Item>

        <Grid.Item>
          <Card.Kpi>
            <Card.Kpi.Label>Situação</Card.Kpi.Label>
            <Card.Kpi.Value status={user.isActive ? "ok" : "urgente"}>
              <Badge.Root
                color={user.isActive ? "green" : "red"}
                appearance="tinted"
                size="sm"
              >
                <Badge.Text>{user.isActive ? "Ativa" : "Inativa"}</Badge.Text>
              </Badge.Root>
            </Card.Kpi.Value>
            <Card.Kpi.Delta>
              {user.isActive
                ? "pode entrar normalmente"
                : "não consegue entrar"}
            </Card.Kpi.Delta>
          </Card.Kpi>
        </Grid.Item>
      </Grid.Root>

      <AccessLinkModal
        user={linkOpen ? { id: user.id, name: user.name } : null}
        onOpenChange={setLinkOpen}
      />
    </>
  );
}
