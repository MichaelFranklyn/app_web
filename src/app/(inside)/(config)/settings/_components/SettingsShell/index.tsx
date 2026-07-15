"use client";

import { PageContent } from "@/components/PageContent";
import { Tabs } from "@/components/Tabs";
import React from "react";
import { SettingsHeader } from "../SettingsHeader";

/**
 * Casca client das configurações (header + abas). Compound components (Tabs.*)
 * não podem ser desestruturados direto num server component — o layout server
 * só resolve o papel e delega o render para cá.
 */
export function SettingsShell({
  isSeller,
  children,
}: {
  isSeller: boolean;
  children: React.ReactNode;
}) {
  return (
    <PageContent>
      <SettingsHeader />

      <div>
        <Tabs.NavList data-tour="settings-tabs">
          {!isSeller && (
            <Tabs.NavItem href="/settings/catalog">
              Catálogos da empresa
            </Tabs.NavItem>
          )}
          <Tabs.NavItem href="/settings/routine">
            Configuração de rotina
          </Tabs.NavItem>
        </Tabs.NavList>

        {children}
      </div>
    </PageContent>
  );
}
