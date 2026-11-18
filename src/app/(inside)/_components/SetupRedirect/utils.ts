export const SETUP_PATH = "/settings/import";

/** Marca da aba: a configuração já foi oferecida nesta entrada no sistema. */
export const SETUP_REDIRECT_SESSION_KEY = "setupRedirectShown";

/**
 * Leva à configuração inicial? Só quando ela está pendente, a pessoa ainda
 * não está nela e esta entrada (aba) ainda não foi levada. Uma vez por
 * entrada, e não a cada navegação: quem saiu da tela de propósito quer ir a
 * outro lugar, e ser puxado de volta a cada clique seria prisão.
 */
export const shouldRedirectToSetup = ({
  pending,
  pathname,
  alreadyShown,
}: {
  pending: boolean;
  pathname: string;
  alreadyShown: boolean;
}): boolean =>
  pending &&
  !alreadyShown &&
  pathname !== SETUP_PATH &&
  !pathname.startsWith(`${SETUP_PATH}/`);

/** `sessionStorage` pode lançar (aba privada, armazenamento bloqueado). Sem
 *  ler, trata como já mostrado: na dúvida, não prende a pessoa num loop. */
export const readShown = (): boolean => {
  try {
    return window.sessionStorage.getItem(SETUP_REDIRECT_SESSION_KEY) === "1";
  } catch {
    return true;
  }
};

export const markShown = (): void => {
  try {
    window.sessionStorage.setItem(SETUP_REDIRECT_SESSION_KEY, "1");
  } catch {
    // Sem armazenamento, a próxima entrada simplesmente não redireciona.
  }
};
