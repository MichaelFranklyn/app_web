"use client";

import { BulletList } from "@/components/BulletList";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

interface Props {
  title: string;
  hint?: ReactNode;
  items: string[];
  /** Quantas linhas aparecem; o resto vira "e mais N". */
  limit?: number;
  /** O que resolve a lista ali mesmo (ex.: cadastrar o que falta). */
  action?: ReactNode;
}

/** Uma lista curta do que ficou de fora, com o que fazer a respeito. */
export function ReviewList({ title, hint, items, limit = 10, action }: Props) {
  if (items.length === 0) return null;
  const hidden = items.length - limit;
  return (
    <Card.Root inset tone="transparent">
      <Card.Body padding="sm">
        <Title variant="body-sm" weight="semibold">
          {title}
        </Title>
        {hint && (
          <Title variant="body-xs" color="muted">
            {hint}
          </Title>
        )}
        <BulletList.Root>
          {items.slice(0, limit).map((item, i) => (
            <BulletList.Item key={`${item}-${i}`}>
              <Title variant="body-xs" color="secondary" as="span">
                {item}
              </Title>
            </BulletList.Item>
          ))}
        </BulletList.Root>
        {hidden > 0 && (
          <Title variant="body-xs" color="muted">
            E mais {hidden}.
          </Title>
        )}
        {action && <div className="pt-4">{action}</div>}
      </Card.Body>
    </Card.Root>
  );
}
