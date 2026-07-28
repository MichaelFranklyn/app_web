"use client";

import { Car, Phone } from "lucide-react";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { CONTACT_TYPE_LABEL, VisitContactType } from "@/utils/visit";

interface Props {
  contactType: VisitContactType;
  className?: string;
}

/**
 * "🚗 Visita" / "📞 Contato" — o que o vendedor precisa saber antes de tudo.
 *
 * Ícone e texto sempre juntos: o ícone sozinho economiza espaço, mas o público
 * é idoso e um telefone estilizado não se lê tão rápido quanto a palavra.
 */
export function ContactTypeTag({ contactType, className }: Props) {
  const isRemote = contactType === "REMOTE";
  const Icon = isRemote ? Phone : Car;

  return (
    <span className={cn("inline-flex items-center gap-4", className)}>
      <Icon
        size={13}
        aria-hidden
        className={cn("shrink-0", isRemote ? "text-(--blue)" : "text-(--fg3)")}
      />
      <Title variant="micro" color={isRemote ? "default" : "muted"}>
        {CONTACT_TYPE_LABEL[contactType]}
      </Title>
    </span>
  );
}
