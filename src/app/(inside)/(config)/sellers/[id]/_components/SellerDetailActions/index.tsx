"use client";

import { Button } from "@/components/Button";
import { Pencil, Power } from "lucide-react";
import { useState } from "react";

import { SellerDetail } from "../../interface";
import { EditSellerModal } from "./EditSellerModal";
import { ToggleSellerModal } from "./ToggleSellerModal";

interface Props {
  seller: SellerDetail;
  onRefetch: () => void;
}

export function SellerDetailActions({ seller, onRefetch }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);

  return (
    <>
      <Button.Root
        appearance="outline"
        color={seller.isActive ? "red" : "green"}
        size="sm"
        onClick={() => setToggleOpen(true)}
      >
        <Button.Icon icon={Power} />
        <Button.Title>{seller.isActive ? "Desativar" : "Ativar"}</Button.Title>
      </Button.Root>

      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        onClick={() => setEditOpen(true)}
      >
        <Button.Icon icon={Pencil} />
        <Button.Title>Editar</Button.Title>
      </Button.Root>

      <EditSellerModal
        seller={seller}
        open={editOpen}
        onOpenChange={setEditOpen}
        onDone={onRefetch}
      />

      <ToggleSellerModal
        seller={seller}
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        onDone={onRefetch}
      />
    </>
  );
}
