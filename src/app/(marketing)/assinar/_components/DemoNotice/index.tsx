import { Title } from "@/components/Title";
import { FlaskConical } from "lucide-react";
import { DEMO_CARDS } from "../../utils";

/**
 * O aviso de que isto é uma simulação. Fica no TOPO, em faixa colorida e antes
 * de qualquer campo: uma tela de pagamento convincente sem aviso convincente é
 * exatamente o que não se deve publicar, mesmo em produto próprio.
 *
 * Traz também os cartões de teste, porque quem abre esta página está avaliando
 * o fluxo — inclusive a tela de recusa.
 */
export function DemoNotice() {
  return (
    <div className="flex flex-col gap-8 rounded-(--radius-md) border border-(--amber-bd) bg-(--amber-bg) p-16">
      <div className="flex items-center gap-8">
        <FlaskConical size={16} className="shrink-0 text-(--amber)" />

        <Title variant="heading-sm" color="amber">
          Simulação — nenhum pagamento é processado
        </Title>
      </div>

      <Title variant="body-sm" color="secondary">
        Esta tela existe para desenhar o fluxo de assinatura enquanto a
        integração com o meio de pagamento não entra. Nada é cobrado, nada é
        enviado e nenhum dado digitado aqui sai do seu navegador.
      </Title>

      <Title variant="body-xs" color="muted">
        Cartão que aprova: {DEMO_CARDS.approved} · Cartão que recusa:{" "}
        {DEMO_CARDS.declined} · Qualquer validade futura e CVV de 3 dígitos.
      </Title>
    </div>
  );
}
