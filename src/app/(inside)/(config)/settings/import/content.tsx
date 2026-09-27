"use client";

import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

import { MigrationStepCard } from "./_components/MigrationStepCard";
import { MIGRATION_STEPS } from "./utils";

export default function ImportSettingsContent() {
  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Trazer dados de outro sistema</PanelHeader.Title>
            <PanelHeader.Description>
              Vindo de outro sistema? Traga sua base em três passos, nesta
              ordem.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <div className="flex flex-col gap-12">
        {MIGRATION_STEPS.map((step) => (
          <MigrationStepCard key={step.number} step={step} />
        ))}
      </div>
    </PageContent>
  );
}
