"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
import { Mail } from "lucide-react";
import { useState } from "react";
import { usePortalLinkEmail } from "../usePortalLinkEmail";

interface Props {
  companyClientId: string;
  clientId: string;
  url: string;
}

/**
 * A segunda porta do link recém-gerado: mandar por email a um contato do
 * cliente, além (ou em vez) do WhatsApp. Só existe enquanto a URL está na tela
 * — depois dela, o endereço não pode ser mostrado de novo.
 */
export function EmailLinkStep({ companyClientId, clientId, url }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const { targets, loading, isSending, send } = usePortalLinkEmail(
    companyClientId,
    clientId,
    true
  );

  if (loading && !targets.length) {
    return (
      <Title variant="body-sm" color="muted">
        Buscando os contatos do cliente…
      </Title>
    );
  }

  if (!targets.length) {
    return (
      <Alert.Root variant="info">
        <Alert.Content>
          <Alert.Title>Nenhum contato do cliente tem email</Alert.Title>
          <Alert.Description>
            Para mandar por email, cadastre o email de um contato na ficha do
            cliente. Pelo WhatsApp já dá para enviar.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  const options: SelectOption[] = targets.map((c) => ({
    value: c.id,
    label: `${c.name}${c.isPrimary ? " (principal)" : ""} · ${c.email}`,
  }));
  const selectedId = picked ?? targets[0].id;

  return (
    <div className="flex flex-col gap-12">
      <Input.Select
        name="portalContact"
        label="Ou mande por email para"
        searchable={false}
        disabledClear
        options={options}
        value={options.find((o) => o.value === selectedId) ?? null}
        onChange={(v) => {
          if (v && !Array.isArray(v)) setPicked(v.value);
        }}
      />
      <div className="flex justify-end">
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          loading={isSending}
          onClick={() => void send(selectedId, url)}
        >
          <Button.Icon icon={Mail} />
          <Button.Title>Enviar por email</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
