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

interface MoreOptionsProps {
  options: MoreOption[];
}

export function MoreOptions({ options }: MoreOptionsProps) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="sm">
          <Button.Icon icon={MoreHorizontal} />
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        {options.map((option) => (
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
