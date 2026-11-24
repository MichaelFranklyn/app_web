"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { MoreOption } from "@/components/MoreOptions";
import { ChevronDown, Store } from "lucide-react";
import { HygieneOptionsArgs, useHygieneOptions } from "./useHygieneOptions";

const renderItems = (options: MoreOption[]) =>
  options.map((option) => (
    <Dropdown.Item
      key={option.label}
      icon={option.icon}
      danger={option.danger}
      onSelect={option.onClick}
    >
      {option.label}
    </Dropdown.Item>
  ));

/**
 * "Situação do cliente": as ações de higienização num lugar só.
 *
 * Botão com NOME, e não um "…": são ações que mudam o que acontece com o
 * cliente dali em diante, e quem procura "o cliente fechou" precisa achar a
 * porta pela palavra. Os itens são frases do que aconteceu, não comandos de
 * cadastro (definidos em `useHygieneOptions`, que a ficha do cliente também
 * usa dentro do menu dela).
 *
 * Cliente que mudou de CNPJ não tem ação: a relação continua no cadastro novo.
 */
export function HygieneActions(props: HygieneOptionsArgs) {
  const { available, registry, wallet, modals, isBusy } =
    useHygieneOptions(props);

  if (!available) return null;

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
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
            {renderItems(registry)}
          </Dropdown.Group>
          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.Label>Carteira</Dropdown.Label>
            {renderItems(wallet)}
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Root>
      {modals}
    </>
  );
}
