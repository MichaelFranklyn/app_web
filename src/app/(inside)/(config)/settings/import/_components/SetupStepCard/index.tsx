"use client";

import { ArrowRight, Check, Lock } from "lucide-react";
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
  /**
   * Configuração concluída e passo feito: o card vira uma linha só (passo,
   * título, situação e o link). Cinco cards inteiros de algo já resolvido
   * empurravam para baixo o que a pessoa vem fazer aqui depois — trazer mais
   * dados (crítica de configurações, 23/11/2026).
   */
  collapsed?: boolean;
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
  // "Feito" discreto: só o texto verde com o check, sem fundo. Feito não pede
  // nada — a tarja cheia disputava o olho com o "Pendente", que pede
  // (crítica de configurações, 23/11/2026).
  if (step.isDone) {
    return (
      <Badge.Root color="green" appearance="ghost" size="sm">
        <Badge.Icon>
          <Check />
        </Badge.Icon>
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
  collapsed = false,
}: Props) {
  const Icon = content.icon;

  if (collapsed) {
    return (
      <Card.Root>
        <Card.Body className="tablet:flex-row tablet:items-center flex flex-col gap-12">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-8">
              <Title variant="eyebrow" color="muted">
                Passo {number}
              </Title>
              <StepStatusBadge step={step} isBlocked={false} />
            </div>
            <Title variant="body" weight="semibold">
              {content.title}
            </Title>
            <Title variant="body-sm" color="muted">
              {summary}
            </Title>
          </div>
          <div className="flex shrink-0 flex-wrap gap-8">
            {extraAction}
            <Button.Link
              href={content.href}
              appearance="outline"
              color="neutral"
              size="sm"
            >
              <Button.Title>{content.action}</Button.Title>
              <Button.Icon icon={ArrowRight} />
            </Button.Link>
          </div>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Body className="flex flex-col gap-16">
        <div className="tablet:flex-row tablet:items-center flex flex-col gap-12">
          {/* Ícone e texto lado a lado também no celular: empilhado, o ícone
              ocupava uma linha sozinho no alto de cada card (crítica de
              configurações, 23/11/2026). Só as ações descem. */}
          <div className="tablet:items-center flex min-w-0 flex-1 items-start gap-12">
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
