"use client";

import { Car, Phone } from "lucide-react";
import { asContactType, contactLabel, VisitContactType } from "@/utils/visit";
import { BadgeIcon } from "../Icon";
import { BadgeRoot } from "../Root";
import { BadgeText } from "../Text";

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
 * Contato remoto em azul (é a exceção na rotina); visita em verde — em cinza
 * a etiqueta sumia na lista (13/11/2026).
 */
export function BadgeContactType({ contactType, className }: Props) {
  const isRemote = asContactType(contactType) === "REMOTE";
  const Icon = isRemote ? Phone : Car;

  return (
    <BadgeRoot color={isRemote ? "blue" : "green"} className={className}>
      <BadgeIcon>
        <Icon />
      </BadgeIcon>
      <BadgeText>{contactLabel(contactType)}</BadgeText>
    </BadgeRoot>
  );
}
