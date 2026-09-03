import { ReactNode } from "react";

/**
 * As explicações da fila de atendimentos.
 *
 * A tela precisa de ajuda por um motivo específico: ela mistura duas coisas que
 * parecem a mesma — de quem é a BOLA (as situações) e de quem é o CLIENTE (o
 * vendedor). Quem lê a fila sem isso cobra a pessoa errada.
 */
export const SUPPORT_HELP: ReactNode = (
  <>
    <p>
      Aqui ficam os <b>problemas que os clientes relatam</b>: mercadoria
      quebrada ou trocada, boleto errado, entrega que não chegou.
    </p>
    <p>
      Cada caso guarda a <b>conversa inteira</b> — cada vez que alguém falou com
      o cliente ou com a fábrica. É o que se mostra quando a fábrica diz que não
      prometeu o que prometeu.
    </p>
  </>
);

/** Colunas: string porque o texto vai no `title` do `<th>` ordenável. */
export const SUPPORT_COLUMN_HELP: Record<string, string> = {
  title:
    "O que o cliente relatou, em uma frase. Clique na linha para abrir o caso inteiro.",
  client:
    "De quem é a reclamação. O vendedor que atende esse cliente aparece junto.",
  factory:
    "Fábrica envolvida. Fica em branco enquanto ninguém identificou qual é.",
  status:
    "De quem é a bola agora: do escritório (em andamento), da fábrica, ou do cliente.",
  priority: "Urgência que quem registrou deu ao caso.",
  age: "Há quantos dias o cliente está esperando, contando do dia em que ele avisou.",
  lastUpdate: "O que aconteceu por último no caso, e quando.",
};
