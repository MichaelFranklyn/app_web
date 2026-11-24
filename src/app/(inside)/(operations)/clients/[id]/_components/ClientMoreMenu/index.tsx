"use client";

import { MoreOptionGroup, MoreOptions } from "@/components/MoreOptions";
import { Share2, Trash2 } from "lucide-react";
import { useState } from "react";

import { useHygieneOptions } from "../../../_shared/hygiene/HygieneActions/useHygieneOptions";
import { WalletStatus } from "../../../_shared/hygiene/interface";
import { DeleteClientModal } from "../DeleteClientModal";
import { SharePortalModal } from "../SharePortalModal";

interface ClientMoreMenuProps {
  companyClientId: string;
  /** Os contatos do portal são do cliente (não do vínculo). */
  clientId: string;
  clientName: string;
  status: WalletStatus;
  /** Situação do cliente é decisão de gestor: o vendedor não vê o bloco. */
  canManage: boolean;
  onChanged: () => void;
  onTransferred: (newCompanyClientId: string) => void;
}

/**
 * Situação do cliente, Compartilhar e Remover num menu só.
 *
 * Eram três botões soltos ao lado de Editar e Ficha de pedido: no celular os
 * cinco empilhavam na largura toda, com as duas tarjas por cima, e a primeira
 * aba só aparecia na segunda tela (crítica de 23/11/2026). Os três são idas
 * ocasionais; o uso de toda visita (ficha, editar) continua à vista. Os
 * blocos levam o nome do assunto ("Situação do cliente") para quem procura
 * "o cliente fechou" achar a porta pela palavra.
 */
export function ClientMoreMenu({
  companyClientId,
  clientId,
  clientName,
  status,
  canManage,
  onChanged,
  onTransferred,
}: ClientMoreMenuProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const hygiene = useHygieneOptions({
    companyClientId,
    clientName,
    status,
    onChanged,
    onTransferred,
  });
  const showHygiene = canManage && hygiene.available;
  // Cliente encerrado não recebe pedido: o portal (onde ele pede sozinho)
  // não tem para onde levar.
  const canShare = status === "ACTIVE";

  const groups: MoreOptionGroup[] = [
    {
      title: "Situação do cliente",
      options: showHygiene ? [...hygiene.registry, ...hygiene.wallet] : [],
    },
    {
      title: "Portal do cliente",
      options: canShare
        ? [
            {
              label: "Compartilhar com o cliente",
              icon: Share2,
              onClick: () => setIsShareOpen(true),
            },
          ]
        : [],
    },
    {
      title: "Carteira",
      options: [
        {
          label: "Remover da carteira",
          icon: Trash2,
          danger: true,
          onClick: () => setIsDeleteOpen(true),
        },
      ],
    },
  ];

  return (
    <>
      <MoreOptions options={groups} label="Mais ações do cliente" showLabel />
      {showHygiene && hygiene.modals}
      {canShare && (
        <SharePortalModal
          companyClientId={companyClientId}
          clientId={clientId}
          clientName={clientName}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
        />
      )}
      <DeleteClientModal
        companyClientId={companyClientId}
        clientName={clientName}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
