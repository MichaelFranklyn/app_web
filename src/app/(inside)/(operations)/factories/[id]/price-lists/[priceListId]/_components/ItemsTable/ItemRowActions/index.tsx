"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteItemModal } from "../DeleteItemModal";
import { EditItemModal } from "../EditItemModal";
import { PriceListItemRow } from "../interface";

interface Props {
  item: PriceListItemRow;
  companyFactoryId: string;
  onChanged: () => void;
}

export function ItemRowActions({ item, companyFactoryId, onChanged }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <MoreOptions
        options={[
          ...(item.product
            ? [
                {
                  label: "Ver produto",
                  icon: Eye,
                  onClick: () =>
                    router.push(
                      `/factories/${companyFactoryId}/products/${item.product!.id}`
                    ),
                },
              ]
            : []),
          {
            label: "Editar",
            icon: Pencil,
            onClick: () => setEditOpen(true),
          },
          {
            label: "Remover",
            icon: Trash2,
            danger: true,
            onClick: () => setDeleteOpen(true),
          },
        ]}
      />

      <EditItemModal
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onChanged}
      />

      <DeleteItemModal
        itemId={item.id}
        productName={item.product?.name ?? "este item"}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={onChanged}
      />
    </>
  );
}
