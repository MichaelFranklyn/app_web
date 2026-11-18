"use client";

import { ArrowRight, Lock } from "lucide-react";
import { ReactNode } from "react";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";

import { SetupStep, SetupStepContent } from "../../interface";

interface Props {
  number: number;
  step: SetupStep;
  content: SetupStepContent;
  /** A situação em números ("3 vendedores cadastrados"). */
  summary: string;
  /** O próximo passo a fazer: o botão dele é o de destaque da tela. */
  isNext: boolean;
  /** O passo anterior que falta concluir: enquanto houver, este fica travado. */
  blockedBy: { number: number; title: string } | null;
  /** Ação extra ao lado do botão principal (ex.: importar planilha). */
  extraAction?: ReactNode;
  /** Detalhe abaixo do texto (ex.: a lista de fábricas). */
  children?: ReactNode;
}

function StepStatusBadge({
  step,
  isBlocked,
}: {
  step: SetupStep;
  isBlocked: boolean;
}) {
  if (isBlocked) {
    return (
      <Badge.Root color="neutral" appearance="tinted" size="sm">
        <Badge.Icon>
          <Lock />
        </Badge.Icon>
        <Badge.Text>Bloqueado</Badge.Text>
      </Badge.Root>
    );
  }
  if (step.isDone) {
    return (
      <Badge.Root color="green" appearance="tinted" size="sm">
        <Badge.Text>Feito</Badge.Text>
      </Badge.Root>
    );
  }
  return (
    <Badge.Root
      color={step.isRequired ? "warning" : "neutral"}
      appearance="tinted"
      size="sm"
    >
      <Badge.Text>{step.isRequired ? "Pendente" : "Opcional"}</Badge.Text>
    </Badge.Root>
  );
}

/** Um passo da configuração: o que fazer, como está e o botão que leva lá. */
export function SetupStepCard({
  number,
  step,
  content,
  summary,
  isNext,
  blockedBy,
  extraAction,
  children,
}: Props) {
  const Icon = content.icon;
  return (
    <Card.Root>
      <Card.Body className="flex flex-col gap-16">
        <div className="tablet:flex-row tablet:items-center flex flex-col gap-12">
          <IconTile aria-hidden shape="square" size="lg">
            <Icon />
          </IconTile>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-8">
              <Title variant="eyebrow" color="muted">
                Passo {number}
              </Title>
              <StepStatusBadge step={step} isBlocked={!!blockedBy} />
            </div>
            <Title variant="heading-sm">{content.title}</Title>
            <Title variant="body-sm" color="muted">
              {content.description}
            </Title>
            <Title variant="body-sm" weight="semibold">
              {blockedBy
                ? `Libera quando o passo ${blockedBy.number} (${blockedBy.title}) estiver feito.`
                : summary}
            </Title>
          </div>
          <div className="tablet:flex-col tablet:items-stretch flex shrink-0 flex-wrap gap-8">
            {extraAction}
            {blockedBy ? (
              // Link não tem "disabled": travado, vira botão desabilitado.
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                disabled
              >
                <Button.Title>{content.action}</Button.Title>
                <Button.Icon icon={Lock} />
              </Button.Root>
            ) : (
              <Button.Link
                href={content.href}
                appearance={isNext ? "solid" : "outline"}
                color={isNext ? "amber" : "neutral"}
                size="sm"
              >
                <Button.Title>{content.action}</Button.Title>
                <Button.Icon icon={ArrowRight} />
              </Button.Link>
            )}
          </div>
        </div>
        {children}
      </Card.Body>
    </Card.Root>
  );
}
