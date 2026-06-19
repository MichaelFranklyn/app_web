"use client";

import { Card } from "@/components/Card";
import { maskCEP, maskCPF, maskPhoneBR } from "@/utils/format/masks";
import { SellerDetail } from "../../../interface";

interface Props {
  seller: SellerDetail;
}

export function SellerInfoCard({ seller }: Props) {
  const addressParts =
    [
      seller.homeStreet && seller.homeNumber
        ? `${seller.homeStreet}, ${seller.homeNumber}`
        : seller.homeStreet,
      seller.homeComplement,
      seller.homeNeighborhood,
      seller.homeCity && seller.homeState
        ? `${seller.homeCity} - ${seller.homeState}`
        : seller.homeCity,
      seller.homeCep ? maskCEP(seller.homeCep) : null,
    ]
      .filter(Boolean)
      .join(" · ") || null;

  const rows: { label: string; value: string | null | undefined }[] = [
    { label: "E-mail", value: seller.user?.email },
    {
      label: "Telefone",
      value: seller.phone ? maskPhoneBR(seller.phone) : null,
    },
    { label: "CPF", value: seller.cpf ? maskCPF(seller.cpf) : null },
    { label: "Região", value: seller.region },
    { label: "Endereço", value: addressParts },
  ];

  const filled = rows.filter((r) => r.value);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Informações
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        {filled.map((row, i) => (
          <Card.Item
            key={row.label}
            variant="stat"
            bordered={i < filled.length - 1}
          >
            <Card.Item.Label className="shrink-0">{row.label}</Card.Item.Label>
            <Card.Item.Value className="wrap-break-words ml-3 min-w-0 text-right">
              {row.value}
            </Card.Item.Value>
          </Card.Item>
        ))}
      </Card.Body>
    </Card.Root>
  );
}
