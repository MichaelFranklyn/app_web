import { Alert } from "@/components/Alert";
import { Input, SelectOption } from "@/components/Input";
import { FactoryContactNode } from "../interface";

interface Props {
  targets: FactoryContactNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * O passo do email: a quem mandar, entre os contatos que têm email.
 *
 * Aqui o PDF vai anexado pelo próprio sistema — o contraste com o WhatsApp é
 * o que a pessoa precisa saber, e por isso o aviso é informativo, não alerta.
 */
export function EmailStep({ targets, selectedId, onSelect }: Props) {
  if (!targets.length) {
    return (
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>Nenhum contato da fábrica tem email</Alert.Title>
          <Alert.Description>
            Cadastre o email de um contato na aba Contatos da fábrica, ou envie
            pelo WhatsApp.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  const options: SelectOption[] = targets.map((c) => ({
    value: c.id,
    label: `${c.name}${c.isPrimary ? " (principal)" : ""} · ${c.email}`,
  }));

  return (
    <>
      <Input.Select
        name="factoryContact"
        label="Enviar para"
        searchable={false}
        disabledClear
        options={options}
        value={options.find((o) => o.value === selectedId) ?? null}
        onChange={(v) => {
          if (v && !Array.isArray(v)) onSelect(v.value);
        }}
      />
      <Alert.Root variant="info">
        <Alert.Content>
          <Alert.Title>O PDF vai anexado</Alert.Title>
          <Alert.Description>
            A fábrica recebe o email com o pedido em PDF. Se ela responder, a
            resposta chega no seu email.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </>
  );
}
