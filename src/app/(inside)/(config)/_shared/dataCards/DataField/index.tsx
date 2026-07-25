"use client";

import { Title } from "@/components/Title";

interface Props {
  label: string;
  value: string;
}

/** Rótulo em cima, valor embaixo — o "—" evita campo vazio sem explicação. */
export function DataField({ label, value }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Title
        variant="micro"
        color="muted"
        className="tracking-[0.08em] uppercase"
      >
        {label}
      </Title>
      <Title variant="body">{value || "—"}</Title>
    </div>
  );
}
