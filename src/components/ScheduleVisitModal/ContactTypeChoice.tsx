"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { Car, Phone } from "lucide-react";

import { VisitContactType } from "./interface";

const CHOICES: { value: VisitContactType; label: string; icon: typeof Car }[] =
  [
    { value: "IN_PERSON", label: "Visita", icon: Car },
    { value: "REMOTE", label: "Ligação", icon: Phone },
  ];

interface Props {
  value: VisitContactType;
  onChange: (value: VisitContactType) => void;
}

/** Visita ou ligação: a mesma parada da agenda, com tipos diferentes. */
export function ContactTypeChoice({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Title variant="label" color="muted">
        O que você vai fazer?
      </Title>
      <div className="flex gap-8">
        {CHOICES.map((choice) => (
          <Button.Root
            key={choice.value}
            type="button"
            appearance={value === choice.value ? "solid" : "outline"}
            color={value === choice.value ? "amber" : "neutral"}
            size="md"
            noUppercase
            fullWidth
            onClick={() => onChange(choice.value)}
          >
            <Button.Icon icon={choice.icon} />
            <Button.Title>{choice.label}</Button.Title>
          </Button.Root>
        ))}
      </div>
    </div>
  );
}
