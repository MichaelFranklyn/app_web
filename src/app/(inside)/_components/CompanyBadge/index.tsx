"use client";

import { Avatar } from "@/components/Avatar";
import { Title } from "@/components/Title";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { cn } from "@/lib/utils";
import { companyInitials } from "@/utils/company";
import { mediaUrl } from "@/utils/media";

/**
 * Identificação da empresa logada, no topo do sistema: o símbolo que o dono
 * enviou (ou as iniciais) e o nome. Mora na topbar, junto das demais
 * informações da sessão — na sidebar competia com a marca do produto logo
 * acima. No mobile fica só o símbolo, para não roubar a barra inteira.
 *
 * Enquanto a empresa não carrega, nada é renderizado: um esqueleto piscando a
 * cada navegação incomodaria mais do que ajuda.
 */
export function CompanyBadge({ className }: { className?: string }) {
  const { name, avatarUrl } = useCompanyBranding();

  if (!name) return null;

  return (
    <div
      className={cn("flex shrink-0 items-center gap-8", className)}
      title={name}
    >
      <Avatar
        size="sm"
        color="amber"
        src={mediaUrl(avatarUrl)}
        alt={name}
        initials={companyInitials(name)}
        className="shrink-0"
      />
      {/* Nome INTEIRO, sem corte: razão social cortada no meio ("CONTATO -
          REPRESENTACOES LT…") não identifica ninguém. Como não cabe em
          qualquer largura, some abaixo do desktop e fica só o símbolo — que
          mantém o `title` com o nome completo. */}
      <Title
        variant="body-sm"
        weight="semibold"
        className="desktop:block hidden whitespace-nowrap"
      >
        {name}
      </Title>
    </div>
  );
}
