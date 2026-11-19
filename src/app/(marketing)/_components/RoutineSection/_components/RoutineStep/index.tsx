import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { ScreenFrame } from "../../../ScreenFrame";

/**
 * Um momento da semana do vendedor: o que ele faz, ao lado da tela onde faz.
 * `reverse` alterna o lado do print no desktop, para a seção não virar uma
 * coluna de texto com uma coluna de imagem.
 *
 * Desde 19/11/2026 o número é uma PARADA do trajeto (o pino âmbar sobre o
 * trilho tracejado da seção), e cada passo diz QUANDO acontece.
 */
export function RoutineStep({
  number,
  when,
  title,
  text,
  image,
  alt,
  reverse = false,
}: {
  number: number;
  when: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  reverse?: boolean;
}) {
  return (
    <li className="tablet:pl-64 relative pl-48">
      {/* O pino da parada, sobre o trilho desenhado pela lista. */}
      <span className="absolute top-0 left-0 flex size-32 items-center justify-center rounded-(--radius-full) bg-(--color-action) shadow-(--shadow-sm) ring-4 ring-(--bg)">
        <Title as="span" variant="label" color="onAction">
          {number}
        </Title>
      </span>

      <div
        className={cn(
          "desktop:items-center desktop:gap-48 grid gap-24",
          // A coluna larga é sempre a do print: invertido, o grid inverte junto.
          reverse
            ? "desktop:grid-cols-[1.6fr_1fr]"
            : "desktop:grid-cols-[1fr_1.6fr]"
        )}
      >
        <div
          className={cn("flex flex-col gap-12", reverse && "desktop:order-2")}
        >
          <span className="flex items-center gap-6">
            <Clock
              aria-hidden
              className="size-[14px] stroke-(--color-action)"
            />
            <Title as="span" variant="label" color="amber">
              {when}
            </Title>
          </span>

          <Title as="h3" variant="heading-md">
            {title}
          </Title>

          <Title variant="body-md" color="secondary" className="max-w-[46ch]">
            {text}
          </Title>
        </div>

        <ScreenFrame
          src={image}
          alt={alt}
          sizes="(min-width: 1200px) 640px, 100vw"
        />
      </div>
    </li>
  );
}
