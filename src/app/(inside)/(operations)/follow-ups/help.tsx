import { BulletList } from "@/components/BulletList";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

/**
 * O que a tela precisa explicar: o que é concluir (falei com o cliente) e o que
 * fazer quando o cliente não atende (reagendar, não concluir).
 */
export const FOLLOW_UPS_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Aqui ficam os <Emphasis>contatos que você combinou de fazer</Emphasis>:
      &quot;me liga semana que vem&quot;, &quot;retornar sobre o orçamento dia
      15&quot;. Cada um tem o dia, quem vai fazer e o motivo.
    </Title>
    <BulletList.Root>
      <BulletList.Item>
        No dia, o contato aparece nas <Emphasis>Pendências</Emphasis> e você
        recebe um lembrete de manhã.
      </BulletList.Item>
      <BulletList.Item>
        <Emphasis>Concluir</Emphasis> é dizer que falou com o cliente — e
        escrever o que foi conversado. Dá para já marcar o próximo.
      </BulletList.Item>
      <BulletList.Item>
        O cliente não atendeu? <Emphasis>Reagende</Emphasis> para outro dia. Não
        vai mais acontecer? <Emphasis>Cancele</Emphasis> dizendo o porquê.
      </BulletList.Item>
    </BulletList.Root>
    <Title variant="body-sm">
      Tudo fica no histórico do cliente, inclusive cada vez que o dia mudou.
    </Title>
  </>
);

/** Colunas: string porque o texto vai no `title` do `<th>`. */
export const FOLLOW_UP_COLUMN_HELP: Record<string, string> = {
  dueDate:
    "O dia combinado. Em vermelho, o que já passou sem ninguém registrar o contato.",
  client: "Com quem falar. Clique na linha para abrir o contato e concluir.",
  reason:
    "Por que voltar ao cliente. Depois de concluído, aparece também o que foi conversado.",
  situation:
    "Atrasado, hoje ou agendado; concluído ou cancelado. Quantas vezes já mudou de dia vai junto.",
  responsible: "Quem vai fazer o contato.",
};
