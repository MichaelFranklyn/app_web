import PlansContent from "./content";

/**
 * A referência do que cada plano entrega. Não faz SSR: o catálogo é constante no
 * backend e o Apollo o guarda para o resto da sessão — semear no servidor só
 * atrasaria a primeira pintura para buscar de novo o que já estaria em cache.
 */
const Page = () => <PlansContent />;

export default Page;
