"use client";

import { PanelHeader } from "@/components/PanelHeader";

export function SettingsHeader() {
  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow>07 — Configurações</PanelHeader.Eyebrow>
          <PanelHeader.Title>
            Configurações
          </PanelHeader.Title>
          <PanelHeader.Description>
            Catálogos da empresa e configuração de rotina de visitas.
          </PanelHeader.Description>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
