"use client";

import { Title } from "@/components/Title";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import Link from "next/link";

import { OpportunityCase } from "../../interface";
import { scheduledNote } from "../../utils";

/**
 * Um cliente prioritário do cartão: o nome, o dado que o coloca ali ("348 dias
 * sem comprar") e o que já está marcado para ele — a mesma regra da lista
 * completa, para o vendedor não repetir a ação já no cartão.
 */
export function SampleRow({ sample }: { sample: OpportunityCase }) {
  const scheduled = scheduledNote(sample);

  // O nome vai inteiro — é por ele que o vendedor reconhece o cliente; o
  // motivo e o que já está marcado vêm embaixo, e não espremidos ao lado.
  const body = (
    <>
      <div className="flex min-w-0 flex-col gap-2">
        <Title variant="body-sm" weight="semibold">
          {sample.label}
        </Title>
        {sample.detail && (
          <Title variant="micro" color="muted">
            {sample.detail}
          </Title>
        )}
        {scheduled && (
          <Title
            variant="micro"
            color="green"
            className="flex items-center gap-4"
          >
            <CalendarCheck size={12} aria-hidden />
            {scheduled}
          </Title>
        )}
      </div>
      {sample.link && (
        <ArrowUpRight
          size={14}
          className="shrink-0 text-(--muted)"
          aria-hidden
        />
      )}
    </>
  );

  const className =
    "flex items-center justify-between gap-12 rounded-(--r-sm) px-8 py-6";

  return sample.link ? (
    <Link
      href={sample.link}
      className={`${className} transition-colors hover:bg-(--bg3)`}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
