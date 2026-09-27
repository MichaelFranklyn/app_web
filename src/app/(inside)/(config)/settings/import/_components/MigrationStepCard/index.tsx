"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";
import { ArrowRight } from "lucide-react";

import { MigrationStep } from "../../interface";

/** Um passo da migração: o que fazer, onde, e o botão que leva até lá. */
export function MigrationStepCard({ step }: { step: MigrationStep }) {
  const Icon = step.icon;
  return (
    <Card.Root>
      <Card.Body className="tablet:flex-row tablet:items-center flex flex-col gap-12">
        <IconTile aria-hidden shape="square" size="lg">
          <Icon />
        </IconTile>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Title variant="eyebrow" color="muted">
            Passo {step.number}
          </Title>
          <Title variant="heading-sm">{step.title}</Title>
          <Title variant="body-sm" color="muted">
            {step.description}
          </Title>
        </div>
        <Button.Link
          href={step.href}
          appearance={step.number === 3 ? "solid" : "outline"}
          color={step.number === 3 ? "amber" : "neutral"}
          size="sm"
          noUppercase
          className="shrink-0"
        >
          <Button.Title>{step.action}</Button.Title>
          <Button.Icon icon={ArrowRight} />
        </Button.Link>
      </Card.Body>
    </Card.Root>
  );
}
