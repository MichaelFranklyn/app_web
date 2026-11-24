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
    // Empilhado (celular/tablet), o texto vai AO LADO do pino: o trilho
    // vertical passa no centro dos pinos (x=23px), e com o texto embaixo dele
    // a linha cortava título e parágrafo (relato de 20/11/2026). No desktop o
    // trilho é horizontal e o texto volta para baixo do pino.
    <li className="desktop:flex desktop:flex-col desktop:gap-12 grid grid-cols-[48px_1fr] gap-x-20">
      <span className="relative flex size-48 items-center justify-center rounded-full bg-(--color-action) shadow-(--shadow-sm) ring-8 ring-(--bg2)">
        <Title as="span" variant="heading-md" color="onAction">
          {number}
        </Title>
      </span>

      <div className="desktop:pt-0 flex min-w-0 flex-col gap-12 pt-10">
        <Title as="h3" variant="heading-md" className="desktop:mt-8">
          {title}
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[36ch]">
          {text}
        </Title>
      </div>
    </li>
  );
}
