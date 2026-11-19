import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Um pedaço ampliado de um print do produto (19/11/2026), para os cartões dos
 * recursos. O print inteiro num cartão de 280px vira miniatura ilegível; o
 * recorte mostra o que importa — o topo da lista, os totais — no tamanho em que
 * se lê.
 *
 * `zoom` é a largura do print em relação à caixa (2 = o dobro da caixa) e
 * `x`/`y` são o canto do recorte em % do PRÓPRIO print (o `translate` em %
 * conta a partir da imagem, não da caixa). Os prints são os do `ScreenFrame`:
 * 1440×900.
 */
export function ScreenCrop({
  src,
  alt,
  zoom,
  x,
  y,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  zoom: number;
  x: number;
  y: number;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-tl-(--radius-md) border-t border-l border-(--border) bg-(--bg) shadow-(--shadow-lg)",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={900}
        sizes={sizes}
        className="absolute top-0 left-0 h-auto max-w-none"
        style={{
          width: `${zoom * 100}%`,
          transform: `translate(-${x}%, -${y}%)`,
        }}
      />
    </div>
  );
}
