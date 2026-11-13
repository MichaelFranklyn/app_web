import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { FactoryContact } from "../utils";

interface Props {
  target: { contact: FactoryContact; phone: string } | null;
}

/** O passo do WhatsApp: para quem vai, e o aviso de que o anexo é na mão. */
export function WhatsAppStep({ target }: Props) {
  if (!target) {
    // Sem telefone não há o que abrir. A saída é concreta: onde cadastrar,
    // ou a outra porta.
    return (
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>Esta fábrica não tem telefone cadastrado</Alert.Title>
          <Alert.Description>
            Cadastre um contato com telefone (com DDD) na aba Contatos da
            fábrica, ou envie por email.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <>
      <Card.Root inset tone="muted">
        <Card.Body padding="sm">
          <Title variant="eyebrow" color="muted">
            Vai para
          </Title>
          <Title variant="body-md" weight="semibold" className="mt-2">
            {target.contact.name}
            {target.contact.isPrimary && " · principal"}
          </Title>
          <Title variant="body-sm" color="secondary">
            {target.contact.phone}
          </Title>
        </Card.Body>
      </Card.Root>

      {/* O aviso do anexo não pode ser discreto: é o único passo que
          continua na mão da pessoa. */}
      <Alert.Root variant="warning">
        <Alert.Content>
          <Alert.Title>Anexe o PDF na conversa</Alert.Title>
          <Alert.Description>
            O arquivo baixa no seu aparelho e a mensagem abre pronta, mas o
            WhatsApp não deixa anexar automaticamente. Toque no clipe e escolha
            o PDF do pedido.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </>
  );
}
