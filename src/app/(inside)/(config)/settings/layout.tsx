"use client";

import { PageContent } from "@/components/PageContent";
import { Tabs } from "@/components/Tabs";
import React from "react";
import { SettingsHeader } from "./_components/SettingsHeader";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContent>
      <SettingsHeader />

      <div>
        <Tabs.NavList>
          <Tabs.NavItem href="/settings/catalog">
            Catálogos da empresa
          </Tabs.NavItem>
          <Tabs.NavItem href="/settings/routine">
            Configuração de rotina
          </Tabs.NavItem>
        </Tabs.NavList>

        {children}
      </div>
    </PageContent>
  );
}
