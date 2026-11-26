"use client";

import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";

interface Props {
  createClients: boolean;
  onCreateClients: (value: boolean) => void;
  createProducts: boolean;
  onCreateProducts: (value: boolean) => void;
}

/** Criar o cliente e o produto que só existem no pedido antigo, ou deixar de fora. */
export function CreateMissingOptions({
  createClients,
  onCreateClients,
  createProducts,
  onCreateProducts,
}: Props) {
  return (
    <Card.Root inset tone="transparent">
      <Card.Body padding="sm">
        <Title variant="micro" color="muted">
          O que ainda não está cadastrado
        </Title>
        <div className="flex flex-col gap-4">
          <Input.Toggle
            label="Criar os clientes que faltam, pelo CNPJ"
            checked={createClients}
            onChange={(e) => onCreateClients(e.target.checked)}
          />
          <Title variant="body-xs" color="muted">
            Entram com o nome que vem no pedido e marcados para conferir; o
            endereço é completado pela Receita aos poucos. Desligado, os pedidos
            de cliente fora da carteira ficam de fora.
          </Title>
          <Title variant="body-xs" color="muted">
            Em todo pedido, o cliente também é ligado à fábrica e ao vendedor,
            com o nível de preço mais usado na fábrica, se o vendedor atende
            essa fábrica. Se não atende, o pedido entra, mas o cliente fica fora
            da rotina dessa fábrica até alguém fazer a ligação.
          </Title>
        </div>
        <div className="flex flex-col gap-4">
          <Input.Toggle
            label="Criar os produtos que faltam no catálogo"
            checked={createProducts}
            onChange={(e) => onCreateProducts(e.target.checked)}
          />
          <Title variant="body-xs" color="muted">
            Entram com o código e o nome que vêm no pedido, embalagem 1,
            marcados para conferir. Desligado, esses itens ficam de fora e o
            resto do pedido entra.
          </Title>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
