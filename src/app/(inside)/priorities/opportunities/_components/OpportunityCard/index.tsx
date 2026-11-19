"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/IconTile";
import { RowList } from "@/components/RowList";
import { Title } from "@/components/Title";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

import { Opportunity } from "../../interface";
import { cardCount, caseTotal, OPPORTUNITY_COPY } from "../../utils";
import { OpportunitySampleRow } from "./SampleRow";

interface Props {
  opportunity: Opportunity;
  /** A lista deste cartão está aberta na página. */
  open: boolean;
  onToggle: () => void;
  /** Sem rotina no plano, "Revisar planejamento" não tem para onde ir. */
  canPlanVisits: boolean;
}

/**
 * Uma oportunidade: quantos clientes, por que vale agir, quem são os primeiros
 * e o caminho para a lista completa.
 *
 * Sem faixa lateral: o destaque é o NÚMERO, grande e em verde no canto — é ele
 * que se compara de relance entre os cartões. Verde, e não vermelho: é escolha
 * comercial, não cobrança (cobrança mora em Pendências).
 */
// Divide a linha com a outra ação; se não couber lado a lado, cada uma desce
// para a sua linha, inteira. (Sobrescreve o w-full de `fullWidthBelowDesktop`.)
const SHARE_ROW_BELOW_DESKTOP =
  "max-desktop:w-auto max-desktop:flex-[1_1_150px]";

export function OpportunityCard({
  opportunity,
  open,
  onToggle,
  canPlanVisits,
}: Props) {
  const copy = OPPORTUNITY_COPY[opportunity.kind];
  const Icon = copy.icon;
  const big = cardCount(opportunity);
  const total = caseTotal(opportunity);
  const plan = canPlanVisits ? copy.planAction : null;

  return (
    <Card.Root data-tour="opportunities-card">
      <Card.Section className="gap-12">
        <div className="flex items-start justify-between gap-12">
          <div className="flex min-w-0 items-start gap-10">
            <IconTile aria-hidden color="green" shape="circle" size="md">
              <Icon />
            </IconTile>
            <div className="flex min-w-0 flex-col gap-2">
              <Title variant="heading-sm">{copy.title}</Title>
              <Title variant="body-xs" color="muted">
                {big.label}
              </Title>
            </div>
          </div>
          <Title variant="kpi" color="green" className="shrink-0 leading-none">
            {big.value}
          </Title>
        </div>
        <Title variant="body-sm" color="secondary">
          {copy.why(opportunity)}
        </Title>
      </Card.Section>

      {opportunity.samples.length > 0 && (
        <Card.Section divided className="gap-6 py-12">
          <Title variant="micro" color="muted">
            Prioritários
          </Title>
          <RowList.Root>
            {/* A chave leva o índice: `sample.id` é o cliente, e o mesmo
                cliente aparece legitimamente em duas fábricas. */}
            {opportunity.samples.map((sample, index) => (
              <RowList.Item key={`${sample.id}-${index}`}>
                <OpportunitySampleRow sample={sample} />
              </RowList.Item>
            ))}
          </RowList.Root>
        </Card.Section>
      )}

      {/* `mt-auto`: as ações encostam no rodapé, alinhadas entre cartões.
          Abaixo do desktop as ações dividem a linha (ou uma a ocupa sozinha),
          com fundo: sem isso sobrava a linha vazia ao lado do botão. */}
      <Card.Section
        divided
        className="mt-auto flex-row flex-wrap items-center justify-between py-12"
      >
        {plan ? (
          <Button.Link
            href={plan.href}
            appearance="solid"
            color="amber"
            size="sm"
            fullWidthBelowDesktop
            className={SHARE_ROW_BELOW_DESKTOP}
          >
            <Button.Title>{plan.label}</Button.Title>
            <Button.Icon icon={ArrowRight} />
          </Button.Link>
        ) : (
          <span className="max-desktop:hidden" />
        )}
        {total > 0 && (
          <Button.Root
            type="button"
            // Primária, aberta ou fechada (18/11/2026): o estado aparece no
            // texto e na seta, não no peso do botão.
            appearance="solid"
            color="amber"
            size="sm"
            fullWidthBelowDesktop
            className={SHARE_ROW_BELOW_DESKTOP}
            aria-expanded={open}
            onClick={onToggle}
            data-tour="opportunities-open"
          >
            <Button.Title>
              {open ? "Fechar lista" : `${copy.listAction} (${total})`}
            </Button.Title>
            <Button.Icon icon={open ? ChevronUp : ChevronDown} />
          </Button.Root>
        )}
      </Card.Section>
    </Card.Root>
  );
}
