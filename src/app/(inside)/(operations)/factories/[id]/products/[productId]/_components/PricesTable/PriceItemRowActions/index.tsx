"use client";

import { Button } from "@/components/Button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditPriceItemModal } from "../EditPriceItemModal";
import { RemovePriceItemModal } from "../RemovePriceItemModal";

interface PriceItemNode {
  id: string;
  unitPrice: string;
  unitPriceWithImpost: string;
}

interface Props {
  item: PriceItemNode;
  label: string;
  onChanged: () => void;
}

export function PriceItemRowActions({ item, label, onChanged }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <Button.Root
        appearance="ghost"
        color="neutral"
        size="sm"
        isIconOnly
        onClick={() => setEditOpen(true)}
      >
        <Button.Icon icon={Pencil} />
      </Button.Root>
      <Button.Root
        appearance="ghost"
        color="red"
        size="sm"
        isIconOnly
        onClick={() => setRemoveOpen(true)}
      >
        <Button.Icon icon={Trash2} />
      </Button.Root>

      <EditPriceItemModal
        item={item}
        label={label}
        open={editOpen}
        onOpenChange={setEditOpen}
        onChanged={onChanged}
      />

      <RemovePriceItemModal
        priceItemId={item.id}
        label={label}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onRemoved={onChanged}
      />
    </>
  );
}
