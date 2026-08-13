"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { PanelHeader } from "@/components/PanelHeader";
import { Title } from "@/components/Title";
import { Ban, RotateCcw, SlidersHorizontal } from "lucide-react";
import { TenantDetail } from "../../interface";
import { tenantSituation } from "../../utils";

interface Props {
  tenant: TenantDetail;
  onToggleStatus: () => void;
  onEditPlan: () => void;
}

const TONE_COLOR = { ok: "green", atencao: "amber", urgente: "red" } as const;

export function TenantHeader({ tenant, onToggleStatus, onEditPlan }: Props) {
  const situation = tenantSituation(tenant);

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow className="text-(--purple)">
            Empresa
          </PanelHeader.Eyebrow>
          <div className="flex flex-wrap items-center gap-8">
            <PanelHeader.Title>
              {tenant.nomeFantasia || tenant.razaoSocial}
            </PanelHeader.Title>
            <Badge.Root
              color={TONE_COLOR[situation.tone]}
              appearance="tinted"
              size="sm"
            >
              <Badge.Text>{situation.label}</Badge.Text>
            </Badge.Root>
          </div>
          <PanelHeader.Description>
            {tenant.cnpj} · {tenant.segment} · plano {tenant.plan}
          </PanelHeader.Description>
          {/* O detalhe da situação é o que diz o que FAZER — o motivo da
              suspensão ou quantos dias faltam de teste. Sem ele o selo é só
              uma cor. */}
          {situation.detail && (
            <Title
              variant="caption"
              color={situation.tone === "urgente" ? "red" : "muted"}
              className="mt-[2px]"
            >
              {situation.detail}
            </Title>
          )}

          {/* Dentro do `Left`: o wrapper das ações é `w-full` e se mede para
              decidir se colapsa em ícones — ao lado do título a medição sai
              errada. Mesma composição do header do dashboard. */}
          <PanelHeader.Actions className="mt-12">
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              noUppercase
              onClick={onEditPlan}
            >
              <Button.Icon icon={SlidersHorizontal} />
              <Button.Title>Plano e limites</Button.Title>
            </Button.Root>

            <Button.Root
              appearance={tenant.isActive ? "outline" : "solid"}
              color={tenant.isActive ? "red" : "amber"}
              size="sm"
              noUppercase
              onClick={onToggleStatus}
            >
              <Button.Icon icon={tenant.isActive ? Ban : RotateCcw} />
              <Button.Title>
                {tenant.isActive ? "Suspender" : "Reativar"}
              </Button.Title>
            </Button.Root>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
