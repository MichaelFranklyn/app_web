"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { MoreHorizontal } from "lucide-react";
import React from "react";

export interface MoreOption {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * Um bloco de ações que pertencem ao mesmo assunto.
 *
 * Existe porque uma lista corrida de ações sugere alternativas — uma parecendo
 * excluir a outra. Quando elas são etapas de coisas diferentes ("o cliente
 * pagou o boleto" e "a fábrica pagou a comissão" se completam, não competem),
 * o título separa os assuntos e a leitura para de enganar.
 */
export interface MoreOptionGroup {
  title: string;
  options: MoreOption[];
}

interface MoreOptionsProps {
  /** Lista simples ou blocos com título; blocos vazios são descartados. */
  options: MoreOption[] | MoreOptionGroup[];
}

const isGrouped = (
  options: MoreOption[] | MoreOptionGroup[]
): options is MoreOptionGroup[] => options.length > 0 && "title" in options[0];

export function MoreOptions({ options }: MoreOptionsProps) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          isIconOnly
          label="Mais ações"
        >
          <Button.Icon icon={MoreHorizontal} />
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        {isGrouped(options)
          ? options
              .filter((group) => group.options.length > 0)
              .map((group, index) => (
                <Dropdown.Group key={group.title}>
                  {index > 0 && <Dropdown.Separator />}
                  <Dropdown.Label>{group.title}</Dropdown.Label>
                  {group.options.map((option) => (
                    <Dropdown.Item
                      key={option.label}
                      icon={option.icon}
                      danger={option.danger}
                      disabled={option.disabled}
                      onSelect={option.onClick}
                    >
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Group>
              ))
          : options.map((option) => (
              <Dropdown.Item
                key={option.label}
                icon={option.icon}
                danger={option.danger}
                disabled={option.disabled}
                onSelect={option.onClick}
              >
                {option.label}
              </Dropdown.Item>
            ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
