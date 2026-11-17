"use client";

import { TextLink } from "@/components/TextLink";
import { Title } from "@/components/Title";
import { isPlatformRole } from "@/utils/auth/roles";
import { useSignedInUser } from "../../useSignedInUser";
import { CtaLink } from "../CtaLink";

/**
 * As portas de entrada do topo do site: "Entrar" e "Testar grátis" para quem
 * chega de fora, "Ir para o sistema" para quem já está logado.
 *
 * Por que uma ilha cliente: as páginas públicas são estáticas e servidas do
 * CDN, então o servidor não sabe quem está olhando. Quem já é cliente e abria
 * `/assinar` pelo botão Assinar via "Entrar / Testar grátis" e achava que
 * tinha saído da conta (17/11/2026). O cookie `userData` é legível pelo
 * navegador — basta ele existir para trocar as portas (`useSignedInUser`).
 */
export function HeaderEntryLinks() {
  const user = useSignedInUser();

  if (user) {
    return (
      <CtaLink
        href={isPlatformRole(user.role) ? "/platform" : "/dashboard"}
        size="sm"
      >
        Ir para o sistema
      </CtaLink>
    );
  }

  return (
    <>
      <TextLink href="/login" tone="inherit" underline="none">
        <Title variant="body-sm" color="inherit" weight="semibold">
          Entrar
        </Title>
      </TextLink>

      <CtaLink href="/signup" size="sm">
        Testar grátis
      </CtaLink>
    </>
  );
}
