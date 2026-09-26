import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

interface UrlBoxProps {
  children: string;
  /** `sm` para o link longo de um token dentro de um modal apertado. */
  size?: "md" | "sm";
  /**
   * Uma linha só, rolando na horizontal — ao lado do botão de copiar, onde a
   * quebra empurraria o botão para baixo. Sem isto, o endereço quebra em
   * qualquer caractere.
   */
  singleLine?: boolean;
  className?: string;
}

/**
 * Um endereço recém-emitido, à vista e selecionável — para copiar à mão quando
 * o botão de copiar não tem permissão.
 */
export function UrlBox({
  children,
  size = "md",
  singleLine = false,
  className,
}: UrlBoxProps) {
  return (
    <div
      className={cn(
        "rounded-(--r-sm) border border-(--border) bg-(--bg3) px-12 py-10",
        singleLine && "overflow-x-auto",
        className
      )}
    >
      <Title
        variant={size === "md" ? "body-sm" : "micro"}
        className={singleLine ? "whitespace-nowrap" : "break-all"}
      >
        {children}
      </Title>
    </div>
  );
}
