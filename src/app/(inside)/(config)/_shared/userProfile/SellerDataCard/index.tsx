"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { DataField, EditCardAction } from "../../dataCards";
import { ProfileSeller } from "../interface";

interface Props {
  seller: ProfileSeller;
  isSelf?: boolean;
  onEdit: () => void;
}

/**
 * O que existe porque a pessoa VENDE. Dados da pessoa (CPF, telefone, endereço)
 * ficam no card "Dados pessoais" — são do usuário, não do perfil de vendedor.
 *
 * O endereço pessoal é também o ponto de partida da rota do dia; sair de outro
 * lugar num dia específico se resolve na própria rota, não aqui.
 */
export function SellerDataCard({ seller, isSelf, onEdit }: Props) {
  return (
    <Card.Root className="desktop:col-span-2">
      <Card.Header>
        <Card.Header.Title>
          {isSelf ? "Sua atuação em campo" : "Atuação em campo"}
        </Card.Header.Title>
        <Card.Header.Description>
          {isSelf
            ? "A região que você atende. Seu endereço, em “Dados pessoais”, é de onde o sistema calcula a sua rota do dia."
            : "A região que esta pessoa atende. O endereço dela, em “Dados pessoais”, é de onde o sistema calcula a rota do dia."}
        </Card.Header.Description>
        <Card.Header.Actions>
          <EditCardAction title="Editar atuação" onClick={onEdit} />
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <DataField label="Região" value={seller.region ?? ""} />
          <DataField
            label="Situação do perfil"
            value={seller.isActive ? "Ativo" : "Inativo"}
          />
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
