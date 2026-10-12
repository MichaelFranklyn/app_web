"use client";

import { Title } from "@/components/Title";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PendingItem } from "../../interface";
import { clientDetail, dueLabel, dueTone } from "../../utils";

/**
 * Uma das pendências mais urgentes do assunto: de quem é, o complemento que a
 * identifica (fábrica e valor, em pedido e boleto) e o prazo — vermelho quando
 * já venceu. O motivo completo fica na lista: aqui a leitura é de relance.
 */
export function SampleRow({ sample }: { sample: PendingItem }) {
  const detail = clientDetail(sample);

  // O nome vai inteiro — é por ele que o vendedor reconhece o cliente.
  const body = (
    <>
      <div className="flex min-w-0 flex-col gap-2">
        <Title variant="body-sm" weight="semibold">
          {sample.clientName}
        </Title>
        {detail && (
          <Title variant="micro" color="muted">
            {detail}
          </Title>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-6">
        <Title variant="body-xs" color={dueTone(sample.daysLate)}>
          {dueLabel(sample.daysLate)}
        </Title>
        {sample.link && (
          <ArrowUpRight size={14} className="text-(--muted)" aria-hidden />
        )}
      </div>
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
