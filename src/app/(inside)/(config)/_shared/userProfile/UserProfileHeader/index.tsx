"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import React from "react";
import { ROLE_COLOR, ROLE_LABEL, UserRole } from "../roles";
import { UserDetail } from "../interface";

interface Props {
  user: UserDetail;
  /** true quando é o próprio usuário logado abrindo o seu perfil. */
  isSelf: boolean;
  actions?: React.ReactNode;
}

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function UserProfileHeader({ user, isSelf, actions }: Props) {
  const role = user.role as UserRole;

  return (
    <div className="flex flex-col gap-8">
      {/* Só na visão do gestor: no próprio perfil o rastro teria um passo único. */}
      {!isSelf && (
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/settings/users">Pessoas</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>{user.name}</Breadcrumb.Item>
        </Breadcrumb.Root>
      )}

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <div className="flex items-center gap-12">
              <Avatar size="lg" color="blue" initials={initials(user.name)} />
              <div className="flex min-w-0 flex-col">
                <PanelHeader.Title>{user.name}</PanelHeader.Title>
                <PanelHeader.Description>
                  {user.email}
                  {user.company
                    ? ` · ${user.company.nomeFantasia ?? user.company.razaoSocial}`
                    : ""}
                </PanelHeader.Description>
              </div>
            </div>

            <PanelHeader.Actions className="mt-12">
              <Badge.Root
                color={ROLE_COLOR[role] ?? "neutral"}
                appearance="tinted"
              >
                <Badge.Text>{ROLE_LABEL[role] ?? user.role}</Badge.Text>
              </Badge.Root>
              <Badge.Root
                color={user.isActive ? "green" : "red"}
                appearance="tinted"
              >
                <Badge.Text>{user.isActive ? "Ativo" : "Inativo"}</Badge.Text>
              </Badge.Root>
              {/* "Vende em campo" saiu: os blocos de rotina, fábricas e carteira
                  na própria página já dizem isso, sem mais um badge para ler. */}
              {actions}
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
