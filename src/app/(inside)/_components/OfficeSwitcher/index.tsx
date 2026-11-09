"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { Title } from "@/components/Title";
import { useMyOffices } from "@/hooks/useMyOffices";
import { useUserData } from "@/hooks/useUserData";
import { CHOOSE_OFFICE_ROUTE, OFFICE_ROLE_LABEL } from "@/utils/auth/offices";
import { Building2, Check, ChevronDown, MailPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyBadge } from "../CompanyBadge";

/**
 * O escritório da sessão, no topo, com a troca para os outros em que a pessoa
 * trabalha — como o seletor de projeto do Google Cloud.
 *
 * Quem trabalha num escritório só (quase todo mundo) vê o mesmo selo de
 * sempre, sem seta nem menu: a opção só aparece quando existe o que escolher
 * ou um convite para responder.
 */
export function OfficeSwitcher() {
  const router = useRouter();
  const { userData } = useUserData();
  // Numa sessão emprestada pelo suporte, trocar de escritório trocaria a
  // sessão DA PESSOA personificada — fora do escopo do atendimento.
  const isImpersonating = !!(userData as { impersonatedBy?: string } | null)
    ?.impersonatedBy;
  const { activeOffices, invitations, enter, enteringId } = useMyOffices({
    skip: isImpersonating,
  });

  const hasChoice = activeOffices.length > 1 || invitations.length > 0;

  if (isImpersonating || !hasChoice) return <CompanyBadge />;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          aria-label="Trocar de escritório"
          loading={!!enteringId}
        >
          <CompanyBadge />
          {invitations.length > 0 && (
            <Title variant="micro" weight="semibold" color="amber">
              {invitations.length}
            </Title>
          )}
          <Button.Icon icon={ChevronDown} />
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content align="start" className="min-w-60">
        <Dropdown.Label>Seus escritórios</Dropdown.Label>
        {activeOffices.map((office) => (
          <Dropdown.Item
            key={office.companyId}
            icon={office.isCurrent ? Check : Building2}
            disabled={office.isCurrent}
            onSelect={() => enter(office)}
          >
            <span className="flex min-w-0 flex-col">
              <Title variant="body-sm" weight="medium" as="span">
                {office.companyName}
              </Title>
              <Title variant="micro" color="muted" as="span">
                {office.isCurrent
                  ? "Você está aqui"
                  : OFFICE_ROLE_LABEL[office.role]}
              </Title>
            </span>
          </Dropdown.Item>
        ))}

        {invitations.length > 0 && (
          <>
            <Dropdown.Separator />
            <Dropdown.Item
              icon={MailPlus}
              onSelect={() => router.push(CHOOSE_OFFICE_ROUTE)}
            >
              {invitations.length === 1
                ? "Ver 1 convite"
                : `Ver ${invitations.length} convites`}
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
