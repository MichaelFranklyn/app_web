import { Title } from "@/components/Title";
import { ArrowRight, Check, X } from "lucide-react";

/**
 * Um incômodo e a sua virada, lado a lado (19/11/2026). À esquerda o "hoje",
 * apagado e sem cor; à direita o "com o Itinus", no branco do cartão e com o
 * âmbar da marca. O contraste entre as metades é o argumento.
 */
export function BeforeAfterRow({
  title,
  before,
  after,
}: {
  title: string;
  before: string;
  after: string;
}) {
  return (
    <li className="desktop:grid-cols-[1fr_auto_1fr] grid items-stretch gap-12">
      <div className="flex flex-col gap-8 rounded-(--r-md) border border-dashed border-(--border2) p-24">
        <span className="flex items-center gap-8">
          <X
            aria-hidden
            className="size-[16px] shrink-0 text-(--color-text-muted)"
          />
          <Title as="h3" variant="heading-sm" color="secondary">
            {title}
          </Title>
        </span>
        <Title variant="body-md" color="muted">
          {before}
        </Title>
      </div>

      <ArrowRight
        aria-hidden
        className="desktop:block hidden size-[20px] self-center stroke-(--color-action)"
      />

      <div className="flex flex-col gap-8 rounded-(--r-md) border border-l-4 border-(--border) border-l-(--color-action) bg-(--bg2) p-24 shadow-(--shadow-sm)">
        <span className="flex items-center gap-8">
          <Check
            aria-hidden
            className="size-[16px] shrink-0 stroke-(--color-action)"
          />
          <Title as="span" variant="label" color="amber">
            Com o Itinus
          </Title>
        </span>
        <Title variant="body-md">{after}</Title>
      </div>
    </li>
  );
}
