"use client";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { LinkBox } from "./LinkBox";
import { useClientPortalLink } from "./useClientPortalLink";

interface SharePortalModalProps {
  companyClientId: string;
  clientName: string;
}

/**
 * Gera e administra o link que o cliente usa para acompanhar as próprias
 * compras.
 *
 * Três estados, e nenhum deles mostra um endereço antigo: quem já emitiu vê
 * quando emitiu, até quando vale e se o cliente chegou a abrir — não a URL.
 * Ela só existe em claro no instante da emissão.
 */
export function SharePortalModal({
  companyClientId,
  clientName,
}: SharePortalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { activeLink, issuedUrl, isFetching, isLoading, load, issue, revoke } =
    useClientPortalLink(companyClientId);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) load();
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm" noUppercase>
          <Button.Icon icon={Share2} />
          <Button.Title>Compartilhar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="lg">
        <Modal.Header
          title="Compartilhar com o cliente"
          description={`Um endereço para ${clientName} acompanhar os pedidos, sem precisar de senha.`}
        />

        <Modal.Body>
          {isFetching ? (
            <Loading.Skeleton className="h-[80px] w-full" />
          ) : issuedUrl ? (
            <LinkBox url={issuedUrl} clientName={clientName} />
          ) : activeLink ? (
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <Title variant="body-sm">
                  Já existe um link ativo, criado em{" "}
                  {formatDate(activeLink.createdAt)} e válido até{" "}
                  {formatDate(activeLink.expiresAt)}.
                </Title>
                <Title variant="body-sm" color="muted">
                  {activeLink.lastAccessedAt
                    ? `O cliente abriu pela última vez em ${formatDate(activeLink.lastAccessedAt)}.`
                    : "O cliente ainda não abriu esta página."}
                </Title>
              </div>
              <Title variant="body-xs" color="muted">
                O endereço não pode ser mostrado de novo — fica guardado
                embaralhado. Se você o perdeu, gere outro; o anterior para de
                funcionar na hora.
              </Title>
            </div>
          ) : (
            <Title variant="body-sm">
              Ainda não há um link para este cliente. Ao gerar, você recebe um
              endereço para mandar por WhatsApp — quem tiver esse endereço vê os
              pedidos, os valores e a situação de cada entrega.
            </Title>
          )}
        </Modal.Body>

        <Modal.Footer>
          {activeLink ? (
            <Button.Root
              appearance="outline"
              color="red"
              size="sm"
              noUppercase
              loading={isLoading}
              onClick={() => void revoke()}
            >
              <Button.Title>Cancelar link</Button.Title>
            </Button.Root>
          ) : null}

          <Button.Root
            appearance="solid"
            color="amber"
            size="sm"
            noUppercase
            loading={isLoading}
            onClick={() => void issue()}
          >
            <Button.Title>
              {activeLink ? "Gerar novo link" : "Gerar link"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
