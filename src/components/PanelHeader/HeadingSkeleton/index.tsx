import { IconTile } from "@/components/IconTile";
import { Loading } from "@/components/Loading";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HeadingSkeletonProps {
  icon: LucideIcon;
  /** Largura da barra no lugar do título (ex.: `w-72`). */
  barClassName?: string;
}

/**
 * O `Heading` enquanto o título (dinâmico) carrega: o ícone já é
 * o real — ele não depende do dado — e só o texto vira barra. Mesma altura
 * do header pronto (14/11/2026): a linha do `Title` tem 41px (25px ×
 * leading-relaxed), não os 32px do ícone — sem o `min-h` a troca empurrava a
 * tela 9px para baixo.
 */
export function HeadingSkeleton({
  icon: Icon,
  barClassName,
}: HeadingSkeletonProps) {
  return (
    <div className="flex min-h-[41px] min-w-0 items-center gap-10">
      <IconTile aria-hidden shape="square" size="sm" color="amber">
        <Icon />
      </IconTile>
      <Loading.Skeleton
        className={cn("h-[20px] w-72 max-w-full", barClassName)}
      />
    </div>
  );
}
