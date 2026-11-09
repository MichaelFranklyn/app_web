"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { OptionCard } from "@/components/OptionCard";
import { QueryError } from "@/components/QueryError";
import { RootPage } from "@/components/RootPage";
import { Title } from "@/components/Title";
import { useMyOffices } from "@/hooks/useMyOffices";
import { logout } from "@/utils/auth/logout";
import { OFFICE_ROLE_LABEL } from "@/utils/auth/offices";
import { Building2, LogOut } from "lucide-react";
import { InvitationRow } from "./_components/InvitationRow";

/**
 * Para quem trabalha em mais de um escritório (a mesma pessoa, o mesmo email):
 * escolhe em qual entrar, como o seletor de projeto do Google Cloud. Cada
 * escritório tem os seus clientes, pedidos e o seu papel. Os convites ainda
 * não respondidos aparecem aqui também.
 */
export default function ChooseOfficeContent() {
  const {
    activeOffices,
    invitations,
    loading,
    error,
    refetch,
    enter,
    enteringId,
    decline,
  } = useMyOffices();

  const isEmpty = !activeOffices.length && !invitations.length;

  return (
    <RootPage.Root className="flex min-h-screen items-center justify-center px-16 py-40">
      <Card.Root className="w-full max-w-120 shadow-(--shadow-md)">
        <Card.Header bg="bg3">
          <Card.Header.Eyebrow>Escritórios</Card.Header.Eyebrow>
          <Card.Header.Title>
            Em qual escritório você vai trabalhar?
          </Card.Header.Title>
          <Card.Header.Description>
            Cada escritório tem os seus clientes e pedidos. Depois, dá para
            trocar pelo nome do escritório no topo da tela.
          </Card.Header.Description>
        </Card.Header>

        <Card.Body className="flex flex-col gap-12">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loading.Spinner />
            </div>
          ) : error ? (
            <QueryError flat onRetry={() => refetch()} />
          ) : (
            <>
              {activeOffices.map((office) => (
                <OptionCard
                  key={office.companyId}
                  icon={Building2}
                  title={office.companyName}
                  description={
                    enteringId === office.companyId
                      ? "Entrando…"
                      : OFFICE_ROLE_LABEL[office.role]
                  }
                  disabled={!!enteringId}
                  onClick={() => enter(office)}
                />
              ))}

              {invitations.length > 0 && (
                <Title variant="caption" weight="semibold" className="pt-8">
                  Convites para você
                </Title>
              )}
              {invitations.map((office) => (
                <InvitationRow
                  key={office.companyId}
                  office={office}
                  isEntering={enteringId === office.companyId}
                  onAccept={enter}
                  onDecline={decline}
                />
              ))}

              {isEmpty && (
                <Title variant="body-sm" color="muted">
                  Você não tem acesso a nenhum escritório no momento. Fale com
                  quem administra o seu escritório.
                </Title>
              )}
            </>
          )}

          <Button.Root
            type="button"
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            className="self-center"
            onClick={() => logout()}
          >
            <Button.Icon icon={LogOut} />
            <Button.Title>Sair</Button.Title>
          </Button.Root>
        </Card.Body>
      </Card.Root>
    </RootPage.Root>
  );
}
