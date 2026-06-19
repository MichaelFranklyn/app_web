"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteSellerModal } from "../DeleteSellerModal";
import { Seller } from "../interface";
import { ToggleSellerModal } from "../ToggleSellerModal";
import { UpdateSellerModal } from "../UpdateSellerModal";

interface SellerRowActionsProps {
  seller: Seller;
  onUpdate: (data: Partial<Seller>) => void;
  onToggle: () => void;
  onRemove: () => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function SellerRowActions({
  seller,
  onUpdate,
  onToggle,
  onRemove,
  onCommit,
  onRollback,
}: SellerRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <MoreOptions
        options={[
          {
            label: "Editar",
            icon: Pencil,
            onClick: () => setEditOpen(true),
          },
          {
            label: seller.isActive ? "Desativar" : "Ativar",
            icon: Power,
            onClick: () => setToggleOpen(true),
          },
          {
            label: "Excluir",
            icon: Trash2,
            danger: true,
            onClick: () => setDeleteOpen(true),
          },
        ]}
      />
      <UpdateSellerModal
        seller={seller}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
        onCommit={onCommit}
        onRollback={onRollback}
      />
      <ToggleSellerModal
        id={seller.id}
        sellerName={seller.name}
        isActive={seller.isActive}
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        onToggle={onToggle}
        onCommit={onCommit}
        onRollback={onRollback}
      />
      <DeleteSellerModal
        id={seller.id}
        sellerName={seller.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onRemove={onRemove}
        onRollback={onRollback}
      />
    </div>
  );
}
