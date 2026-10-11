import FollowUpContent from "./content";

/**
 * Um contato agendado, com o histórico. Rota (e não modal) porque tem ações
 * próprias — concluir, reagendar, corrigir, cancelar — e modal sobre modal é
 * proibido no sistema.
 */
const Page = () => <FollowUpContent />;

export default Page;
