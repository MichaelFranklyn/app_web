"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { InsightSample } from "../../interface";
import { REASON_COPY } from "../../utils";

/**
 * Uma linha da lista completa: de quem se trata, o dado que o coloca ali e —
 * quando existe — por que o sistema já o explica.
 *
 * O motivo vira etiqueta com dica, e não texto corrido, porque a lista pode ter
 * cem linhas: repetir "o sistema não manda visitar uma fábrica de que o cliente
 * acabou de comprar" cem vezes transformaria a explicação em ruído. A etiqueta
 * nomeia; a dica, ao passar o mouse, ensina o que fazer.
 */
export function CaseRow({ item }: { item: InsightSample }) {
  const reason = item.reason ? REASON_COPY[item.reason] : null;
  const ReasonIcon = reason?.icon;

  const body = (
    <>
      <div className="flex min-w-0 flex-col gap-2">
        <Title variant="body-sm" weight="semibold" className="truncate">
          {item.label}
        </Title>
        {item.detail && (
          <Title variant="micro" color="muted">
            {item.detail}
          </Title>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-8">
        {reason && ReasonIcon && (
          <Tooltip content={reason.hint}>
            <Badge.Root appearance="tinted" color="neutral" size="xs">
              <Badge.Icon>
                <ReasonIcon />
              </Badge.Icon>
              <Badge.Text>{reason.label}</Badge.Text>
            </Badge.Root>
          </Tooltip>
        )}
        {item.link && (
          <ArrowUpRight size={14} className="text-(--muted)" aria-hidden />
        )}
      </div>
    </>
  );

  const className =
    "flex items-center justify-between gap-12 rounded-(--r-sm) border border-transparent px-10 py-8 hover:border-(--border) hover:bg-(--bg3)";

  return (
    <li>
      {item.link ? (
        <Link href={item.link} className={`${className} transition-colors`}>
          {body}
        </Link>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}
