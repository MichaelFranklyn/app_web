import SupportCaseContent from "./content";

/**
 * O caso aberto, com a linha do tempo. Rota (e não modal) porque tem ações
 * próprias — registrar andamento, corrigir a ficha, excluir — e modal sobre
 * modal é proibido no sistema.
 */
const Page = () => <SupportCaseContent />;

export default Page;
