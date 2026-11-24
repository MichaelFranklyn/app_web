"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { X } from "lucide-react";

interface TourCardProps {
  title?: string;
  description?: string;
  current: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

// Caixa do tour montada com os componentes do design system. O posicionamento e o
// overlay/spotlight ficam no TourLayer.
export const TourCard = ({
  title,
  description,
  current,
  total,
  isFirst,
  isLast,
  onPrev,
  onNext,
  onClose,
}: TourCardProps) => (
  <div className="flex w-[320px] max-w-[90vw] flex-col gap-12 rounded-(--r-lg) border border-(--border) bg-(--bg) p-12 shadow-(--shadow-lg)">
    <div className="flex items-start justify-between gap-8">
      {title && (
        <Title variant="body-md" weight="semibold">
          {title}
        </Title>
      )}
      {/* O mesmo "fechar" do Modal e do Drawer (era um <button> cru). */}
      <Button.Root
        appearance="ghost"
        color="neutral"
        size="sm"
        isIconOnly
        label="Fechar tutorial"
        onClick={onClose}
        className="-mt-4 -mr-4 shrink-0"
      >
        <Button.Icon icon={X} />
      </Button.Root>
    </div>

    {description && (
      <Title variant="body-sm" color="muted">
        {description}
      </Title>
    )}

    <div className="flex items-center justify-between gap-8 pt-4">
      <Title variant="body-xs" color="muted">
        {current} de {total}
      </Title>

      <div className="flex items-center gap-8">
        {!isFirst && (
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            onClick={onPrev}
          >
            <Button.Title>Voltar</Button.Title>
          </Button.Root>
        )}
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          onClick={onNext}
        >
          <Button.Title>{isLast ? "Concluir" : "Próximo"}</Button.Title>
        </Button.Root>
      </div>
    </div>
  </div>
);
