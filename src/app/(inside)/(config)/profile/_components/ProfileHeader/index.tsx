"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { MyProfile } from "../../interface";
import { ROLE_COLOR, ROLE_LABEL } from "../../utils";

interface Props {
  profile: MyProfile;
}

export function ProfileHeader({ profile }: Props) {
  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item>Configurações</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>Meu Perfil</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              Configurações · Meu Perfil
            </PanelHeader.Eyebrow>
            <div className="flex items-center gap-12">
              <Avatar size="lg" color="blue" initials={initials} />
              <div className="flex flex-col">
                <PanelHeader.Title>
                  {profile.name}
                </PanelHeader.Title>
                <PanelHeader.Description>
                  {profile.email}
                  {profile.company
                    ? ` · ${profile.company.nomeFantasia ?? profile.company.razaoSocial}`
                    : ""}
                </PanelHeader.Description>
              </div>
            </div>
            <PanelHeader.Actions className="mt-6">
              <Badge.Root
                color={ROLE_COLOR[profile.role] ?? "neutral"}
                appearance="tinted"
              >
                <Badge.Text>
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </Badge.Text>
              </Badge.Root>
              <Badge.Root
                color={profile.isActive ? "green" : "red"}
                appearance="tinted"
              >
                <Badge.Text>
                  {profile.isActive ? "Ativo" : "Inativo"}
                </Badge.Text>
              </Badge.Root>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
