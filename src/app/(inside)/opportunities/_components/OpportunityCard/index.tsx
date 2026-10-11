"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Divider } from "@/components/Divider";
import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

import { Opportunity } from "../../interface";
import { cardCount, caseTotal, OPPORTUNITY_COPY } from "../../utils";

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
 * Verde, e não vermelho: é escolha comercial, não cobrança. O que é cobrança
 * mora em Pendências.
 */
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
    <Card.Root accent="green" data-tour="opportunities-card">
      <Card.Body className="flex h-full flex-col gap-12">
        <div className="flex items-start gap-10">
          <IconTile aria-hidden color="green" shape="square" size="sm">
            <Icon />
          </IconTile>
          <div className="flex flex-col gap-2">
            <Title variant="heading-sm">{copy.title}</Title>
            <Title variant="body-sm" color="secondary">
              <Title
                as="span"
                variant="body-sm"
                weight="semibold"
                color="green"
              >
                {big.value}
              </Title>{" "}
              {big.label}
            </Title>
          </div>
        </div>

        <Title variant="body-sm" color="secondary">
          {copy.why(opportunity)}
        </Title>

        {opportunity.samples.length > 0 && (
          <div className="flex flex-col gap-6">
            <Title variant="micro" color="muted">
              Prioritários
            </Title>
            <div className="flex flex-wrap items-center gap-6">
              {/* A chave leva o índice: `sample.id` é o cliente, e o mesmo
                  cliente aparece legitimamente em duas fábricas. */}
              {opportunity.samples.map((sample, index) => (
                <Chip
                  key={`${sample.id}-${index}`}
                  href={sample.link ?? undefined}
                >
                  {sample.label}
                  {sample.detail && <Chip.Detail>{sample.detail}</Chip.Detail>}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* `mt-auto`: as ações encostam no rodapé, alinhadas entre cartões. */}
        <div className="mt-auto flex flex-col gap-12">
          <Divider.Root />
          <div className="flex flex-wrap items-center justify-end gap-8">
            {plan && (
              <Button.Link
                href={plan.href}
                appearance="ghost"
                color="neutral"
                size="sm"
                noUppercase
              >
                <Button.Title>{plan.label}</Button.Title>
                <Button.Icon icon={ArrowRight} />
              </Button.Link>
            )}
            {total > 0 && (
              <Button.Root
                type="button"
                appearance={open ? "tinted" : "outline"}
                color={open ? "amber" : "neutral"}
                size="sm"
                noUppercase
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
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
