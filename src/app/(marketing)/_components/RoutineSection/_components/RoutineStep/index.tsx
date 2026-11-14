import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ScreenFrame } from "../../../ScreenFrame";

/**
 * Um momento da semana do vendedor: o que ele faz, ao lado da tela onde faz.
 * `reverse` alterna o lado do print no desktop, para a seção não virar uma
 * coluna de texto com uma coluna de imagem.
 */
export function RoutineStep({
  number,
  title,
  text,
  image,
  alt,
  reverse = false,
}: {
  number: number;
  title: string;
  text: string;
  image: string;
  alt: string;
  reverse?: boolean;
}) {
  return (
    <li
      className={cn(
        "desktop:items-center desktop:gap-48 grid gap-24",
        // A coluna larga é sempre a do print: invertido, o grid inverte junto.
        reverse
          ? "desktop:grid-cols-[1.6fr_1fr]"
          : "desktop:grid-cols-[1fr_1.6fr]"
      )}
    >
      <div className={cn("flex flex-col gap-12", reverse && "desktop:order-2")}>
        <span className="flex size-32 items-center justify-center rounded-(--radius-full) bg-(--cyan-bg)">
          <Title as="span" variant="label" color="cyan">
            {number}
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
    </li>
  );
}
