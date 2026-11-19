import { Title } from "@/components/Title";
import { Section } from "../Section";
import { FaqItem } from "../FaqItem";
import { FAQ } from "./utils";

/** Perguntas frequentes, logo antes do último convite. */
export function FaqSection() {
  return (
    <Section id="perguntas" tone="raised">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          O que costumam perguntar antes
        </Title>
      </div>

      <div className="mt-32 flex max-w-[840px] flex-col gap-12">
        {FAQ.map((item) => (
          <FaqItem key={item.question} {...item} />
        ))}
      </div>
    </Section>
  );
}
