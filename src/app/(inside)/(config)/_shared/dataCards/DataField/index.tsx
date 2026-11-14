"use client";

import { Title } from "@/components/Title";
import type { ReactNode } from "react";

interface Props {
  label: string;
  /** Texto ou peça de texto (ex.: `<DocumentNumber>`, que não quebra linha). */
  value: ReactNode;
}

/** Rótulo em cima, valor embaixo — o "—" evita campo vazio sem explicação. */
export function DataField({ label, value }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <Title variant="body">{value || "—"}</Title>
    </div>
  );
}
