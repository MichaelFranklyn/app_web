"use client";

import { Car, Phone } from "lucide-react";
import { forwardRef, HTMLAttributes } from "react";
import { asContactType, contactLabel, VisitContactType } from "@/utils/visit";
import { BadgeIcon } from "../Icon";
import { BadgeRoot } from "../Root";
import { BadgeText } from "../Text";

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Tolera ausência: item vindo de backend defasado cai em "Visita". */
  contactType: VisitContactType | null | undefined;
}

/**
 * "🚗 Visita" / "📞 Contato" — o que o vendedor precisa saber antes de tudo.
 *
 * Ícone e texto sempre juntos: o ícone sozinho economiza espaço, mas o público
 * é idoso e um telefone estilizado não se lê tão rápido quanto a palavra.
 * Contato remoto em azul (é a exceção na rotina); visita em verde — em cinza
 * a etiqueta sumia na lista (13/11/2026).
 *
 * Repassa ref e eventos: pode ser o gatilho de um Tooltip (o score por
 * fábrica na prévia da semana).
 */
export const BadgeContactType = forwardRef<HTMLSpanElement, Props>(
  function BadgeContactType({ contactType, ...rest }, ref) {
    const isRemote = asContactType(contactType) === "REMOTE";
    const Icon = isRemote ? Phone : Car;

    return (
      <BadgeRoot ref={ref} color={isRemote ? "blue" : "green"} {...rest}>
        <BadgeIcon>
          <Icon />
        </BadgeIcon>
        <BadgeText>{contactLabel(contactType)}</BadgeText>
      </BadgeRoot>
    );
  }
);
