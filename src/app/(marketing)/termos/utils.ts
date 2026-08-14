import { CONTACT_EMAIL, LegalSection, SERVICE_NAME } from "../legal";

/** Onde o cliente fala com a gente. Enquanto não houver e-mail declarado, o
 * caminho é o suporte de dentro do sistema — mandar o cliente escrever para um
 * endereço que ninguém lê seria pior do que não oferecer canal. */
const CONTACT_PATH = CONTACT_EMAIL
  ? `pelo e-mail ${CONTACT_EMAIL}`
  : "pelo canal de suporte informado dentro do sistema";

/**
 * Termos de uso. O texto descreve o que o sistema realmente faz — planos com
 * teto, teste com tudo liberado, dado do cliente que é do cliente, exportação
 * em XLSX e PDF. Promessa que o produto não cumpre vira disputa depois.
 *
 * Ainda precisa de revisão jurídica antes de valer como contrato: limitação de
 * responsabilidade, foro e rescisão são cláusulas que um advogado ajusta ao
 * risco real da operação.
 */
export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "O que é o serviço",
    paragraphs: [
      `O ${SERVICE_NAME} é um sistema de gestão comercial oferecido pela internet, sob assinatura, para escritórios de representação e equipes de venda. Ele reúne cadastro de fábricas e clientes, catálogo e tabelas de preço, pedidos, faturamento, comissões, rotina de visitas e relatórios.`,
      "O acesso é feito pelo navegador, sem instalação. Não vendemos licença de software nem entregamos código: o que se contrata é o uso do sistema enquanto a assinatura estiver ativa.",
    ],
  },
  {
    heading: "Conta e cadastro",
    paragraphs: [
      "Para usar o sistema é preciso criar a conta da empresa e informar dados verdadeiros de identificação. Quem cria a conta responde por ela e pelos acessos que abrir para a equipe.",
      "Cada pessoa tem o próprio login. Compartilhar senha é proibido: além do risco de segurança, o sistema registra quem fez cada operação, e um login compartilhado apaga essa informação justamente quando ela é necessária.",
      "Você é responsável por manter as credenciais em sigilo e por avisar assim que suspeitar de acesso indevido.",
    ],
  },
  {
    heading: "Período de teste e planos",
    paragraphs: [
      "Toda conta nova começa em um período de teste com os recursos liberados, para que a avaliação seja feita com o sistema inteiro e não com uma versão reduzida.",
      "Depois do teste, o uso segue no plano contratado. Cada plano define os recursos disponíveis e os limites de volume — número de usuários, vendedores, clientes e fábricas. Ao atingir um limite, o sistema recusa a criação do registro seguinte e informa o motivo, em vez de cobrar automaticamente por excedente.",
      "Trocar de plano é possível a qualquer momento. Ao mudar para um plano menor, os dados permanecem armazenados; o que muda são os recursos acessíveis e os limites de volume.",
    ],
  },
  {
    heading: "Pagamento",
    paragraphs: [
      "O valor, a periodicidade e a forma de pagamento são os definidos na contratação. Não há cobrança durante o período de teste.",
      "A falta de pagamento pode levar à suspensão do acesso, com aviso prévio. Suspensão não apaga dados: eles permanecem disponíveis para exportação durante o prazo informado no aviso.",
    ],
  },
  {
    heading: "Uso correto do sistema",
    paragraphs: [
      "Você se compromete a usar o sistema dentro da lei e a não tentar acessar dados de outras empresas, contornar limites de plano, sobrecarregar a infraestrutura de propósito ou submeter conteúdo ilícito.",
      "É proibido usar o sistema para enviar comunicação não solicitada em massa ou para tratar dados pessoais de terceiros sem base legal para isso.",
    ],
  },
  {
    heading: "Seus dados são seus",
    paragraphs: [
      "Clientes, pedidos, tabelas de preço e todo o conteúdo que sua empresa cadastra continuam sendo dela. Nós os tratamos para operar o serviço, conforme a Política de Privacidade.",
      "Você pode exportar suas listas em XLSX e PDF a qualquer momento, sem depender de pedido formal.",
      "Cada empresa é isolada das demais dentro do sistema, e o que cada perfil enxerga depende do papel que tem na operação.",
    ],
  },
  {
    heading: "Disponibilidade e mudanças no sistema",
    paragraphs: [
      "Trabalhamos para manter o serviço disponível, mas ele depende de infraestrutura de terceiros e pode ter interrupções para manutenção, correção ou por falha fora do nosso controle.",
      "O sistema evolui: recursos são adicionados, ajustados e, eventualmente, substituídos. Mudanças que reduzam de forma relevante o que já era usado serão comunicadas com antecedência razoável.",
    ],
  },
  {
    heading: "Cálculos e decisões comerciais",
    paragraphs: [
      "O sistema calcula valores, impostos, comissões e sugestões de visita a partir do que foi cadastrado. Cadastro errado gera resultado errado: a conferência dos dados e das notas fiscais continua sendo da sua empresa.",
      "As sugestões de visita e de prioridade de cliente são apoio à decisão, baseadas em histórico. Elas não substituem o julgamento de quem conhece a carteira.",
    ],
  },
  {
    heading: "Encerramento",
    paragraphs: [
      "Você pode encerrar a assinatura quando quiser, sem carência. Exporte o que precisar antes do encerramento.",
      `Podemos encerrar o acesso em caso de descumprimento destes termos ou de uso que coloque em risco o serviço e os demais clientes, com comunicação ${CONTACT_PATH}.`,
    ],
  },
  {
    heading: "Limitação de responsabilidade",
    paragraphs: [
      "O serviço é fornecido no estado em que se encontra, com o esforço técnico razoável de manutenção e segurança. Não respondemos por lucros cessantes nem por decisões comerciais tomadas com base em informação cadastrada de forma incorreta.",
      "Nada nesta cláusula afasta os direitos previstos em lei, inclusive os do Código de Defesa do Consumidor quando aplicáveis.",
    ],
  },
  {
    heading: "Alterações destes termos",
    paragraphs: [
      "Estes termos podem ser atualizados. A data de vigência no topo indica a última alteração, e mudanças relevantes são comunicadas dentro do sistema.",
      "Continuar usando o serviço depois da alteração significa concordar com o texto novo.",
    ],
  },
  {
    heading: "Lei aplicável",
    paragraphs: [
      "Estes termos são regidos pela lei brasileira. Fica eleito o foro do domicílio do contratante para as questões que não puderem ser resolvidas de forma amigável.",
      `Dúvidas sobre este documento podem ser encaminhadas ${CONTACT_PATH}.`,
    ],
  },
];
