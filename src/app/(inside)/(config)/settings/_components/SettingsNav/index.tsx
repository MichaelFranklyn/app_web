"use client";

import { SubNav } from "@/components/SubNav";

import { visibleSettingsNav } from "../../navigation";

interface Props {
  role?: string | null;
}

/** O menu interno de Configurações, já recortado pelo papel. */
export function SettingsNav({ role }: Props) {
  const groups = visibleSettingsNav(role);
  if (groups.length === 0) return null;
  return (
    <SubNav.Root aria-label="Configurações" data-tour="settings-nav">
      {groups.map((group) => (
        <SubNav.Group key={group.label} label={group.label}>
          {group.links.map((link) => (
            <SubNav.Item
              key={link.href}
              href={link.href}
              icon={link.icon}
              matchPrefix={link.matchPrefix}
            >
              {link.label}
            </SubNav.Item>
          ))}
        </SubNav.Group>
      ))}
    </SubNav.Root>
  );
}
