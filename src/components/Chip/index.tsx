import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const CHIP =
  "inline-flex items-baseline rounded-(--r-sm) border border-(--border) bg-(--bg3) px-8 py-[3px]";

interface ChipProps {
  /** Com `href`, o chip leva à tela do registro (realce ao passar o mouse). */
  href?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Um registro citado pelo nome (o cliente, a fábrica, o pedido), em caixa
 * pequena. Diferente do `Badge`, não é status: o texto sai como foi escrito,
 * sem caixa alta.
 */
const Root = ({ href, className, children }: ChipProps) => {
  const text = (
    <Title variant="micro" weight="semibold" as="span">
      {children}
    </Title>
  );

  return href ? (
    <Link
      href={href}
      className={cn(
        CHIP,
        "transition-colors hover:border-(--border2) hover:bg-(--bg4) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)",
        className
      )}
    >
      {text}
    </Link>
  ) : (
    <span className={cn(CHIP, className)}>{text}</span>
  );
};

/** O complemento depois do nome (" · Fábrica X"), apagado. */
const Detail = ({ children }: { children: React.ReactNode }) => (
  <Title variant="micro" weight="regular" color="muted" as="span">
    {" "}
    · {children}
  </Title>
);

export const Chip = Object.assign(Root, { Detail });
