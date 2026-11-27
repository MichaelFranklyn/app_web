"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";

interface Props {
  createClients: boolean;
  onCreateClients: (value: boolean) => void;
  createProducts: boolean;
  onCreateProducts: (value: boolean) => void;
}

interface OptionProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  /** O que acontece com a opção ligada e desligada: só a que vale aparece. */
  on: string;
  off: string;
}

/** Uma escolha: o interruptor e, embaixo, uma frase do que ele faz agora. */
function Option({ label, checked, onChange, on, off }: OptionProps) {
  return (
    <Card.Root inset tone="transparent">
      <Card.Body padding="sm">
        <Input.Toggle
          label={label}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <Title variant="body-xs" color="muted">
          {checked ? on : off}
        </Title>
      </Card.Body>
    </Card.Root>
  );
}

/** Criar o cliente e o produto que só existem no pedido antigo, ou deixar de fora. */
export function CreateMissingOptions({
  createClients,
  onCreateClients,
  createProducts,
  onCreateProducts,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Title variant="heading-sm">O que ainda não está cadastrado</Title>
      <Title variant="body-sm" color="muted">
        Se um pedido trouxer cliente ou produto que o sistema ainda não tem,
        escolha o que fazer.
      </Title>
      <Grid.Root cols={{ base: 1, tablet: 2 }} gap={12}>
        <Option
          label="Criar os clientes que faltam"
          checked={createClients}
          onChange={onCreateClients}
          on="O cliente é criado pelo CNPJ, com o nome do pedido, e marcado para você conferir depois."
          off="Os pedidos de clientes fora da carteira não entram."
        />
        <Option
          label="Criar os produtos que faltam"
          checked={createProducts}
          onChange={onCreateProducts}
          on="O produto é criado com o código e o nome do pedido, e marcado para você conferir depois."
          off="Os itens de produtos fora do catálogo não entram; o resto do pedido entra."
        />
      </Grid.Root>
    </div>
  );
}
