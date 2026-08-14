import { Title } from "@/components/Title";
import { TRIAL_DAYS } from "../../../plans";
import { FaqItem } from "../../../_components/FaqItem";
import { Section } from "../../../_components/Section";

/**
 * As dúvidas que aparecem na hora de decidir o plano — todas sobre dinheiro e
 * compromisso, não sobre produto. As de produto estão na home.
 */
const PRICING_FAQ = [
  {
    question: "Preciso de cartão para testar?",
    answer: `Não. Você cria a conta da empresa e usa ${TRIAL_DAYS} dias com o sistema inteiro liberado, inclusive o motor de visita. Terminado o prazo, o acesso é interrompido até a contratação — nada é cobrado automaticamente.`,
  },
  {
    question: "O que está incluído no valor?",
    answer:
      "Todos os recursos do plano, para todos os usuários que couberem nos limites dele. Não há taxa de implantação, cobrança por pedido emitido nem custo extra por relatório. O Enterprise é o único fechado caso a caso, porque não tem teto de volume.",
  },
  {
    question: "Posso trocar de plano depois?",
    answer:
      "Pode, nos dois sentidos. Ao subir, o que estava bloqueado aparece na hora. Ao descer, os dados continuam lá — o que muda é o que fica visível e até onde vai o volume.",
  },
  {
    question: "O que acontece se eu passar do limite de vendedores?",
    answer:
      "O sistema avisa e recusa a criação do vendedor que passaria do teto, em vez de cobrar a mais sem você saber. Aí é conversa de mudar de plano.",
  },
  {
    question: "Existe fidelidade?",
    answer:
      "Não trabalhamos com carência. Se decidir sair, você exporta suas listas em XLSX e PDF antes de encerrar.",
  },
  {
    question: "E se minha operação for maior que o Pro?",
    answer:
      "É o caso do Enterprise: mesma matriz de recursos, sem teto de volume, com as condições combinadas caso a caso. Comece pelo teste e converse com a gente durante ele.",
  },
];

export function PricingFaq() {
  return (
    <Section>
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="muted">
          Perguntas
        </Title>

        <Title variant="heading-lg">Sobre contratar</Title>
      </div>

      <div className="mt-32 flex max-w-[840px] flex-col gap-12">
        {PRICING_FAQ.map((item) => (
          <FaqItem key={item.question} {...item} />
        ))}
      </div>
    </Section>
  );
}
