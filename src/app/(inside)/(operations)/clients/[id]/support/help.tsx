import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

/**
 * A explicação da aba. Não é enfeite: "atendimento" é palavra elástica, e sem
 * dizer o que entra aqui a aba viraria caderno de recado — o que a tornaria
 * inútil como fila de tratativas.
 */
export const CLIENT_SUPPORT_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Os <Emphasis>problemas que este cliente relatou</Emphasis>: mercadoria
      quebrada ou trocada, boleto errado, entrega que não chegou.
    </Title>
    <Title variant="body-sm">
      Cada caso guarda a conversa inteira — com o cliente e com a fábrica.
      Abrindo um deles você vê o que já foi feito e registra o próximo passo.
    </Title>
  </>
);
