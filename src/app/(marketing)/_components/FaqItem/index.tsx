import { Title } from "@/components/Title";
import { ChevronDown } from "lucide-react";

/**
 * Pergunta expansível em `<details>`/`<summary>` nativos.
 *
 * Sem `"use client"` de propósito: abrir e fechar é comportamento do próprio
 * HTML, com teclado e leitor de tela já resolvidos pelo navegador. Trocar isso
 * por estado em React custaria JavaScript na página estática para reimplementar
 * — pior — o que já vem de graça. O texto da resposta sai no HTML da primeira
 * resposta mesmo fechado, então o buscador lê tudo.
 */
export function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-(--radius-md) border border-(--border) bg-(--bg2) px-24 py-16">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-16">
        <Title variant="heading-sm">{question}</Title>

        <ChevronDown
          size={18}
          className="shrink-0 text-(--muted) transition group-open:rotate-180"
        />
      </summary>

      <Title
        variant="body-sm"
        color="muted"
        className="mt-12 block max-w-[72ch]"
      >
        {answer}
      </Title>
    </details>
  );
}
