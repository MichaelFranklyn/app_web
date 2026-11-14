/**
 * Aviso de "navegação começou" para quem navega por CÓDIGO (router.push).
 *
 * O clique num <a> a barra de carregamento já percebe sozinha. Aba que troca a
 * query, linha de tabela clicável e o botão Voltar chamam `router.push`, e
 * para o resto da tela isso é invisível; quem faz isso anuncia aqui.
 */
export const NAVIGATION_START_EVENT = "itinus:navigation-start";

export const announceNavigation = (href: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string>(NAVIGATION_START_EVENT, { detail: href })
  );
};
