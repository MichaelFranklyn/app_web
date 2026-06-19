"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { maskCPF, maskPhoneBR } from "@/utils/format/masks";
import Link from "next/link";
import React from "react";
import { SellerDetail } from "../../interface";

interface Props {
  seller: SellerDetail;
  actions?: React.ReactNode;
}

export function SellerPageHeader({ seller, actions }: Props) {
  const meta = [
    seller.phone ? maskPhoneBR(seller.phone) : null,
    seller.region,
    seller.cpf ? `CPF ${maskCPF(seller.cpf)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item>
          <Link href="/sellers">Vendedores</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>{seller.name}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              Vendedores
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>{seller.name}</PanelHeader.Title>
            {meta && <PanelHeader.Description>{meta}</PanelHeader.Description>}
            <PanelHeader.Actions className="mt-6">
              <Badge.Root
                color={seller.isActive ? "green" : "red"}
                appearance="tinted"
                size="sm"
              >
                <Badge.Text>{seller.isActive ? "Ativo" : "Inativo"}</Badge.Text>
              </Badge.Root>
              {actions}
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
