import { CONTACT_EMAIL, LegalSection, SERVICE_NAME } from "../legal";

const CONTACT_PATH = CONTACT_EMAIL
  ? `pelo e-mail ${CONTACT_EMAIL}`
  : "pelo canal de suporte informado dentro do sistema";

/**
 * Política de privacidade, escrita a partir do que o sistema faz de verdade —
 * inclusive os terceiros que ele usa (nuvem em São Paulo, hospedagem do site,
 * geocodificação de endereço, consulta pública de CNPJ).
 *
 * Listar subprocessador é o que a LGPD espera e é também o que evita a pior
 * conversa possível: descobrir depois que o endereço do cliente sai para um
 * serviço de mapas que ninguém mencionou.
 *
 * A separação controlador × operador está explícita porque ela muda quem
 * responde ao titular: os dados dos CLIENTES da representação são da
 * representação, não nossos.
 */
export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Quem responde pelos dados",
    paragraphs: [
      `Há dois papéis diferentes aqui, e vale separá-los. Sobre os dados de quem contrata e usa o ${SERVICE_NAME} — a empresa e as pessoas com login —, nós somos os controladores.`,
      "Sobre os dados que a sua empresa cadastra na operação dela — clientes, contatos, endereços, pedidos —, quem decide o que coletar e para quê é a sua empresa. Ela é a controladora, e nós agimos como operadores, tratando esses dados apenas para fazer o sistema funcionar e conforme as instruções dela.",
    ],
  },
  {
    heading: "Que dados são tratados",
    paragraphs: [
      "Dados de cadastro da empresa e das pessoas com acesso: razão social e CNPJ, nome, e-mail, telefone, CPF do vendedor quando informado e o endereço de partida usado para montar a rota do dia.",
      "Dados da operação, inseridos por você: clientes e seus contatos e endereços, fábricas representadas, produtos, tabelas de preço, pedidos, faturamento, comissões, visitas e observações de estoque.",
      "Dados de uso: registros de acesso e de operações feitas no sistema (quem fez o quê e quando), endereço IP e informações técnicas do navegador, além de métricas agregadas de audiência e desempenho das páginas.",
      "O sistema não rastreia a localização do vendedor em tempo real. O que existe é o endereço de partida que ele mesmo cadastra e os endereços dos clientes, usados para calcular distância e ordem de visita.",
    ],
  },
  {
    heading: "Para que servem",
    paragraphs: [
      "Para dar acesso ao sistema e manter a conta funcionando; para executar o que o serviço promete — calcular preço, imposto e comissão, montar rotina de visita, gerar relatórios; para segurança, prevenção a fraude e apuração de incidentes; e para melhorar o produto a partir de indicadores de uso.",
      "As bases legais são a execução do contrato, o cumprimento de obrigação legal e o legítimo interesse na segurança e na melhoria do serviço. Quando alguma finalidade depender de consentimento, ele será pedido de forma separada e poderá ser retirado.",
      "Não vendemos dados pessoais, não os cedemos para publicidade de terceiros e não usamos o conteúdo da sua operação para treinar modelos.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "Usamos cookies essenciais para manter a sessão de quem faz login. Eles são gravados de forma que o navegador não os expõe a scripts da página, e sem eles o sistema não tem como saber que você já entrou.",
      "As métricas de audiência e desempenho do site são agregadas e não servem para publicidade nem para criar perfil de navegação.",
    ],
  },
  {
    heading: "Com quem os dados são compartilhados",
    paragraphs: [
      "Com prestadores de infraestrutura necessários para o serviço existir, cada um tratando apenas o necessário: Google Cloud, que hospeda o servidor da aplicação em São Paulo; Supabase, onde ficam o banco de dados e os arquivos, também em São Paulo; e Vercel, que hospeda e entrega as páginas e coleta as métricas agregadas de audiência e desempenho.",
      "Com serviços de apoio, quando a função é usada: Google Maps Platform, para transformar o endereço de um cliente em coordenadas e calcular a ordem da rota; o serviço público Nominatim, do OpenStreetMap, como alternativa quando o primeiro não responde; e as bases públicas de consulta de CNPJ, para preencher o cadastro a partir do número informado.",
      "Com autoridades, quando houver obrigação legal ou ordem judicial.",
    ],
  },
  {
    heading: "Onde os dados ficam",
    paragraphs: [
      "O banco de dados e o servidor da aplicação ficam no Brasil, na região de São Paulo.",
      "A entrega das páginas e as métricas agregadas de uso passam por infraestrutura da Vercel, que opera fora do país. Nesse caso há transferência internacional, limitada a dados técnicos e de navegação, com as garantias contratuais oferecidas pelo fornecedor.",
    ],
  },
  {
    heading: "Por quanto tempo",
    paragraphs: [
      "Os dados da operação ficam disponíveis enquanto a conta existir. Encerrada a assinatura, eles permanecem pelo prazo necessário para exportação e para o cumprimento de obrigações legais, e depois são eliminados ou anonimizados.",
      "Os registros de atividade dentro do sistema são mantidos por período limitado e depois descartados automaticamente; os registros ligados à segurança da plataforma são preservados por mais tempo, porque servem justamente para investigar o que aconteceu.",
    ],
  },
  {
    heading: "Segurança",
    paragraphs: [
      "O tráfego é criptografado, as senhas são armazenadas com algoritmo próprio para isso (nunca em texto legível) e cada empresa é isolada das demais dentro do sistema.",
      "O acesso é individual, com permissões por papel: o que um vendedor enxerga é a carteira dele, não a da empresa inteira. Operações sensíveis ficam registradas.",
      "Nenhuma medida elimina risco por completo. Em caso de incidente de segurança relevante, comunicaremos os afetados e a autoridade, conforme a lei.",
    ],
  },
  {
    heading: "Seus direitos",
    paragraphs: [
      "A LGPD garante ao titular confirmar se há tratamento, acessar seus dados, corrigir o que estiver incorreto, pedir anonimização, bloqueio ou eliminação do que for desnecessário, solicitar portabilidade e obter informação sobre compartilhamentos.",
      `Se você é uma pessoa com login no sistema, pode exercer esses direitos ${CONTACT_PATH}. Se você é cliente de uma representação que usa o ${SERVICE_NAME}, o pedido deve ser dirigido a ela, que é quem decide sobre esses dados — recebendo um pedido assim, nós o encaminhamos e apoiamos a resposta.`,
    ],
  },
  {
    heading: "Crianças e adolescentes",
    paragraphs: [
      "O sistema é uma ferramenta de trabalho e não se destina a menores de 18 anos. Não coletamos dados de crianças e adolescentes de forma consciente.",
    ],
  },
  {
    heading: "Mudanças nesta política",
    paragraphs: [
      "Esta política pode ser atualizada — por exemplo, quando um fornecedor de infraestrutura mudar. A data no topo indica a última revisão, e mudanças relevantes são comunicadas dentro do sistema.",
      `Dúvidas sobre este documento podem ser encaminhadas ${CONTACT_PATH}.`,
    ],
  },
];
