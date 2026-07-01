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
  <div className="flex w-[320px] max-w-[90vw] flex-col gap-12 rounded-lg border border-(--border) bg-(--bg) p-12 shadow-xl">
    <div className="flex items-start justify-between gap-8">
      {title && (
        <Title variant="body-md" weight="semibold">
          {title}
        </Title>
      )}
      <button
        type="button"
        aria-label="Fechar tutorial"
        onClick={onClose}
        className="shrink-0 cursor-pointer rounded p-4 text-(--muted) transition-colors hover:bg-(--bg3) hover:text-(--text)"
      >
        <X size={16} strokeWidth={2} />
      </button>
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
