import { Title } from "@/components/Title";

/**
 * Um passo da migração. Desde 19/11/2026 o número é uma parada âmbar sobre o
 * trilho tracejado que a seção desenha atrás dos três pinos — a leitura em
 * diagonal mostra "são só três, em sequência" antes de qualquer palavra.
 */
export function StepCard({
  number,
  title,
  text,
}: {
  number: number;
  title: string;
  text: string;
}) {
  return (
    <li className="flex flex-col gap-12">
      <span className="relative flex size-48 items-center justify-center rounded-(--radius-full) bg-(--color-action) shadow-(--shadow-sm) ring-8 ring-(--bg2)">
        <Title as="span" variant="heading-md" color="onAction">
          {number}
        </Title>
      </span>

      <Title as="h3" variant="heading-md" className="mt-8">
        {title}
      </Title>

      <Title variant="body-md" color="secondary" className="max-w-[36ch]">
        {text}
      </Title>
    </li>
  );
}
