"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteProductModal } from "../DeleteProductModal";
import { EditProductModal } from "../EditProductModal";
import { ToggleProductModal } from "../ToggleProductModal";
import { FactoryProduct } from "../gql";

interface Props {
  product: FactoryProduct;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<FactoryProduct>) => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function ProductRowActions({
  product,
  onChanged,
  onUpdateOptimistic,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <MoreOptions
        options={[
          {
            label: "Editar",
            icon: Pencil,
            onClick: () => setEditOpen(true),
          },
          {
            label: product.isActive ? "Desativar" : "Ativar",
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

      <EditProductModal
        product={product}
        open={editOpen}
        onOpenChange={setEditOpen}
        onChanged={onChanged}
        onUpdateOptimistic={onUpdateOptimistic}
        onCommit={onCommit}
        onRollback={onRollback}
      />

      <ToggleProductModal
        product={product}
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        onChanged={onChanged}
        onUpdateOptimistic={onUpdateOptimistic}
        onCommit={onCommit}
        onRollback={onRollback}
      />

      <DeleteProductModal
        productId={product.id}
        productName={product.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onChanged={onChanged}
        onRemoveOptimistic={onRemoveOptimistic}
        onCommit={onCommit}
        onRollback={onRollback}
      />
    </>
  );
}
