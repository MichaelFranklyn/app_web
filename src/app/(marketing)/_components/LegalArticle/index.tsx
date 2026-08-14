import { Title } from "@/components/Title";
import { LEGAL_ENTITY, LEGAL_UPDATED_AT, LegalSection } from "../../legal";
import { Section } from "../Section";

/**
 * Casca dos dois documentos legais: título, vigência, identificação de quem
 * responde pelo serviço e as seções numeradas.
 *
 * Uma coluna estreita (`max-w-[72ch]`) porque isto é para LER, não para varrer
 * com o olho — linha longa em texto corrido faz o leitor perder a próxima.
 *
 * A identificação some enquanto a empresa não estiver declarada em `legal.ts`.
 * Melhor um documento sem o bloco do que um bloco com dado de mentira.
 */
export function LegalArticle({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <Section className="flex max-w-[820px] flex-col gap-32">
      <header className="flex flex-col gap-12">
        <Title variant="label" color="muted">
          Atualizado em {LEGAL_UPDATED_AT}
        </Title>

        <Title variant="heading-xl">{title}</Title>

        <Title variant="body-md" color="secondary">
          {intro}
        </Title>

        {LEGAL_ENTITY && (
          <Title variant="body-sm" color="muted">
            {LEGAL_ENTITY.name} — CNPJ {LEGAL_ENTITY.document},{" "}
            {LEGAL_ENTITY.address}.
          </Title>
        )}
      </header>

      <div className="flex flex-col gap-32">
        {sections.map((section, index) => (
          <article key={section.heading} className="flex flex-col gap-12">
            <Title variant="heading-md">
              {index + 1}. {section.heading}
            </Title>

            {/* `body-md` (15px), e não o `body-sm` do resto do site: aqui o
                texto é para ser lido inteiro, e a coluna de 820px já limita a
                linha em cerca de 75 caracteres. */}
            {section.paragraphs.map((paragraph) => (
              <Title key={paragraph} variant="body-md" color="secondary">
                {paragraph}
              </Title>
            ))}
          </article>
        ))}
      </div>
    </Section>
  );
}
