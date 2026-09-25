"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import {
  ArrowRightLeft,
  ChevronDown,
  RefreshCw,
  RotateCcw,
  Store,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import { EndClientModal } from "../EndClientModal";
import { TransferCnpjModal } from "../TransferCnpjModal";
import { EndingStatus, HygieneTarget } from "../interface";
import { isWalletActive } from "../utils";
import { useHygieneMutations } from "./useHygieneMutations";

interface Props extends HygieneTarget {
  /** O cliente mudou: a tela recarrega o que mostra. */
  onChanged: () => void;
  /** Mudou de CNPJ: para onde ir (a ficha navega para o cadastro novo). */
  onTransferred?: (newCompanyClientId: string) => void;
}

/**
 * "Situação do cliente": as ações de higienização num lugar só.
 *
 * Botão com NOME, e não um "…": são ações que mudam o que acontece com o
 * cliente dali em diante, e quem procura "o cliente fechou" precisa achar a
 * porta pela palavra. Os itens são frases do que aconteceu, não comandos de
 * cadastro.
 *
 * Cliente que mudou de CNPJ não tem ação: a relação continua no cadastro novo.
 */
export function HygieneActions({
  companyClientId,
  clientName,
  status,
  onChanged,
  onTransferred,
}: Props) {
  const [ending, setEnding] = useState<EndingStatus | null>(null);
  const [transferring, setTransferring] = useState(false);
  const { runReactivate, runReceita, isBusy } = useHygieneMutations(
    companyClientId,
    onChanged
  );

  if (status === "SUCCEEDED") return null;
  const active = isWalletActive(status);

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
            loading={isBusy}
          >
            <Button.Icon icon={Store} />
            <Button.Title>Situação do cliente</Button.Title>
            <Button.Icon icon={ChevronDown} />
          </Button.Root>
        </Dropdown.Trigger>
        <Dropdown.Content align="end">
          <Dropdown.Group>
            <Dropdown.Label>Cadastro</Dropdown.Label>
            <Dropdown.Item icon={RefreshCw} onSelect={runReceita}>
              Mudou de nome: atualizar pela Receita
            </Dropdown.Item>
            {active && (
              <Dropdown.Item
                icon={ArrowRightLeft}
                onSelect={() => setTransferring(true)}
              >
                Mudou de CNPJ
              </Dropdown.Item>
            )}
          </Dropdown.Group>
          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.Label>Carteira</Dropdown.Label>
            {active ? (
              <>
                <Dropdown.Item
                  icon={UserMinus}
                  danger
                  onSelect={() => setEnding("CLOSED")}
                >
                  Não existe mais
                </Dropdown.Item>
                <Dropdown.Item
                  icon={UserMinus}
                  danger
                  onSelect={() => setEnding("ENDED")}
                >
                  Não trabalhamos mais com ele
                </Dropdown.Item>
              </>
            ) : (
              <Dropdown.Item icon={RotateCcw} onSelect={runReactivate}>
                Reativar cliente
              </Dropdown.Item>
            )}
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Root>

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
  );
}
