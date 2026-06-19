"use client";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { Title } from "@/components/Title";
import { logout } from "@/utils/auth/logout";
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserMenuProps } from "./interface";

export function UserMenu({ name, role, initials }: UserMenuProps) {
  const router = useRouter();

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="amber"
          isIconOnly
          noPadding
          aria-label="Abrir menu do usuário"
          className="rounded-full"
        >
          <Avatar size="sm" color="amber" initials={initials} alt={name} />
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content align="end" className="min-w-50 p-12">
        <div className="flex flex-col gap-[2px] pb-8">
          <Title variant="caption" weight="semibold" className="truncate">
            {name}
          </Title>
          {role && (
            <Title variant="micro" color="muted" className="truncate">
              {role}
            </Title>
          )}
        </div>

        <Dropdown.Separator />

        <Dropdown.Item
          icon={UserCircle}
          onSelect={() => router.push("/profile")}
        >
          Meu Perfil
        </Dropdown.Item>

        <Dropdown.Item icon={LogOut} danger onSelect={() => logout()}>
          Sair
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
