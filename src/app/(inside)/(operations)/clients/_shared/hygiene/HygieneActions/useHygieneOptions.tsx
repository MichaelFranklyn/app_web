"use client";

import { MoreOption } from "@/components/MoreOptions";
import { ArrowRightLeft, RefreshCw, RotateCcw, UserMinus } from "lucide-react";
import { ReactNode, useState } from "react";
import { EndClientModal } from "../EndClientModal";
import { TransferCnpjModal } from "../TransferCnpjModal";
import { EndingStatus, HygieneTarget } from "../interface";
import { isWalletActive } from "../utils";
import { useHygieneMutations } from "./useHygieneMutations";

export interface HygieneOptionsArgs extends HygieneTarget {
  /** O cliente mudou: a tela recarrega o que mostra. */
  onChanged: () => void;
  /** Mudou de CNPJ: para onde ir (a ficha navega para o cadastro novo). */
  onTransferred?: (newCompanyClientId: string) => void;
}

export interface HygieneOptions {
  /** Cliente que mudou de CNPJ não tem ação: a relação continua no novo. */
  available: boolean;
  /** "Mudou de nome", "Mudou de CNPJ". */
  registry: MoreOption[];
  /** Encerrar (dois motivos) ou reativar. */
  wallet: MoreOption[];
  /** Os modais que os itens abrem — renderize junto do menu. */
  modals: ReactNode;
  isBusy: boolean;
}

/**
 * Os itens de "Situação do cliente" sem o gatilho.
 *
 * A lista de higienização mostra-os num botão próprio por linha
 * (`HygieneActions`); a ficha do cliente junta-os às outras ações ocasionais
 * num menu só, para o celular não empilhar cinco botões (crítica de
 * 23/11/2026). Um lugar só define os itens, as frases e os modais.
 */
export function useHygieneOptions({
  companyClientId,
  clientName,
  status,
  onChanged,
  onTransferred,
}: HygieneOptionsArgs): HygieneOptions {
  const [ending, setEnding] = useState<EndingStatus | null>(null);
  const [transferring, setTransferring] = useState(false);
  const { runReactivate, runReceita, isBusy } = useHygieneMutations(
    companyClientId,
    onChanged
  );

  const available = status !== "SUCCEEDED";
  const active = isWalletActive(status);

  const registry: MoreOption[] = [
    {
      label: "Mudou de nome: atualizar pela Receita",
      icon: RefreshCw,
      onClick: () => void runReceita(),
    },
    ...(active
      ? [
          {
            label: "Mudou de CNPJ",
            icon: ArrowRightLeft,
            onClick: () => setTransferring(true),
          },
        ]
      : []),
  ];

  const wallet: MoreOption[] = active
    ? [
        {
          label: "Não existe mais",
          icon: UserMinus,
          danger: true,
          onClick: () => setEnding("CLOSED"),
        },
        {
          label: "Não trabalhamos mais com ele",
          icon: UserMinus,
          danger: true,
          onClick: () => setEnding("ENDED"),
        },
      ]
    : [
        {
          label: "Reativar cliente",
          icon: RotateCcw,
          onClick: () => void runReactivate(),
        },
      ];

  const modals = available ? (
    <>
      {ending && (
        <EndClientModal
          companyClientId={companyClientId}
          clientName={clientName}
          open
          onOpenChange={(open) => !open && setEnding(null)}
          initialStatus={ending}
          onDone={onChanged}
        />
      )}
      <TransferCnpjModal
        companyClientId={companyClientId}
        clientName={clientName}
        open={transferring}
        onOpenChange={setTransferring}
        onDone={(newId) => {
          onChanged();
          onTransferred?.(newId);
        }}
      />
    </>
  ) : null;

  return { available, registry, wallet, modals, isBusy };
}
