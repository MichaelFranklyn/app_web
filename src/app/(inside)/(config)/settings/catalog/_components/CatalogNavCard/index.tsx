"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Atalho para um catálogo. O card inteiro é o link — alvo grande é mais fácil de
 * acertar do que um texto pequeno, e a seta diz que aqui se entra em outra tela.
 */
export function CatalogNavCard({
  href,
  label,
  description,
  icon: Icon,
}: Props) {
  return (
    <Link href={href} className="group block h-full">
      <Card.Root className="h-full transition-colors group-hover:border-(--amber) group-focus-visible:border-(--amber)">
        <Card.Body className="flex items-start gap-12">
          <span className="mt-1 shrink-0 text-(--amber)">
            <Icon size={20} />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Title variant="heading-sm">{label}</Title>
            <Title variant="body-sm" color="muted">
              {description}
            </Title>
          </div>

          <span className="mt-1 shrink-0 text-(--muted)">
            <ChevronRight size={18} />
          </span>
        </Card.Body>
      </Card.Root>
    </Link>
  );
}
