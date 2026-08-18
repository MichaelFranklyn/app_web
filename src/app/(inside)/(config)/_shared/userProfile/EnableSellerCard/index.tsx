"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PlanLimitGate } from "@/components/PlanLimitGate";
import { Title } from "@/components/Title";
import { Store } from "lucide-react";

interface Props {
  /** Próprio perfil — o caso do proprietário que decide vender também. */
  isSelf?: boolean;
  onEnable: () => void;
}

/**
 * Lugar do "owner que também vende": quem não tem perfil de campo vê o card no
 * mesmo ponto onde os dados de campo apareceriam, com a ação para habilitá-lo.
 *
 * Trocar o papel para "Vendedor" no cadastro NÃO serve para isso — rebaixaria o
 * acesso da pessoa. Papel é o que ela vê; perfil de vendedor é como ela opera.
 */
export function EnableSellerCard({ isSelf, onEnable }: Props) {
  return (
    <Card.Root className="desktop:col-span-2">
      <Card.Header>
        <Card.Header.Title>Atuação em campo</Card.Header.Title>
        <Card.Header.Description>
          {isSelf
            ? "Você ainda não vende em campo."
            : "Esta pessoa ainda não vende em campo."}
        </Card.Header.Description>
      </Card.Header>
      <Card.Body className="flex flex-col items-start gap-12">
        <Title variant="body-sm" color="muted">
          {isSelf
            ? "Ao habilitar, você ganha rotina de visitas, acesso a fábricas e carteira de clientes — e continua com o mesmo nível de acesso que tem hoje."
            : "Ao habilitar, ela ganha rotina de visitas, acesso a fábricas e carteira de clientes — e continua com o mesmo nível de acesso que tem hoje."}
        </Title>
        {/* Habilitar perfil de campo cria um vendedor, e vendedor tem teto no
            plano (`createSeller` cobra a cota SELLERS). O botão fica visível e
            explica o limite — é a mesma frase que a mutation devolveria. */}
        <PlanLimitGate limit="SELLERS">
          <Button.Root
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            onClick={onEnable}
          >
            <Button.Icon icon={Store} />
            <Button.Title>
              {isSelf
                ? "Passar a vender em campo"
                : "Habilitar perfil de vendedor"}
            </Button.Title>
          </Button.Root>
        </PlanLimitGate>
      </Card.Body>
    </Card.Root>
  );
}
