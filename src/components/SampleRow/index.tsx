import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import React from "react";

interface SampleRowProps {
  /** O nome inteiro — é por ele que o vendedor reconhece o cliente. */
  label: string;
  /** O dado que coloca a linha ali ("348 dias sem comprar"), em cinza. */
  detail?: string | null;
  /** Linha extra embaixo do detalhe (o que já está marcado, por exemplo). */
  children?: React.ReactNode;
  /** O que fica à direita, antes da seta: prazo, valor. */
  aside?: React.ReactNode;
  /** Com endereço a linha inteira vira link, com a seta ↗ e fundo no hover. */
  href?: string | null;
}

/**
 * Uma linha de AMOSTRA dentro de um cartão-resumo — os "mais urgentes" da
 * central de pendências, os clientes prioritários das oportunidades. A lista
 * completa fica na tela do assunto; aqui a leitura é de relance.
 */
export function SampleRow({
  label,
  detail,
  children,
  aside,
  href,
}: SampleRowProps) {
  const body = (
    <>
      <div className="flex min-w-0 flex-col gap-2">
        <Title variant="body-sm" weight="semibold">
          {label}
        </Title>
        {detail && (
          <Title variant="micro" color="muted">
            {detail}
          </Title>
        )}
        {children}
      </div>
      {(aside || href) && (
        <div className="flex shrink-0 items-center gap-6">
          {aside}
          {href && (
            <ArrowUpRight size={14} className="text-(--muted)" aria-hidden />
          )}
        </div>
      )}
    </>
  );

  const base =
    "flex items-center justify-between gap-12 rounded-(--r-sm) px-8 py-6";

  return href ? (
    <NextLink
      href={href}
      className={cn(base, "transition-colors hover:bg-(--bg3)")}
    >
      {body}
    </NextLink>
  ) : (
    <div className={base}>{body}</div>
  );
}
