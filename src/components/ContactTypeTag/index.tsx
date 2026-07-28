"use client";

import { Car, Phone } from "lucide-react";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { asContactType, contactLabel, VisitContactType } from "@/utils/visit";

interface Props {
  /** Tolera ausência: item vindo de backend defasado cai em "Visita". */
  contactType: VisitContactType | null | undefined;
  className?: string;
}

/**
 * "🚗 Visita" / "📞 Contato" — o que o vendedor precisa saber antes de tudo.
 *
 * Ícone e texto sempre juntos: o ícone sozinho economiza espaço, mas o público
 * é idoso e um telefone estilizado não se lê tão rápido quanto a palavra.
 */
export function ContactTypeTag({ contactType, className }: Props) {
  const isRemote = asContactType(contactType) === "REMOTE";
  const Icon = isRemote ? Phone : Car;

  return (
    <span className={cn("inline-flex items-center gap-4", className)}>
      <Icon
        size={13}
        aria-hidden
        className={cn("shrink-0", isRemote ? "text-(--blue)" : "text-(--fg3)")}
      />
      <Title variant="micro" color={isRemote ? "default" : "muted"}>
        {contactLabel(contactType)}
      </Title>
    </span>
  );
}
