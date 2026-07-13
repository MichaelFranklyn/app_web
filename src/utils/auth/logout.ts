import { removeCookie } from "../cookies/clientCookie";
import { deleteSession } from "./session";

// Cookies legíveis por JS gravados na sessão (o `token` é httpOnly e só a rota
// /api/session consegue apagá-lo).
const CLIENT_AUTH_COOKIES = ["remember", "userData"];

export const logout = async () => {
  // Limpa o token httpOnly no servidor…
  await deleteSession();
  // …e os cookies legíveis por JS (best-effort; a rota também os apaga).
  CLIENT_AUTH_COOKIES.forEach((name) => removeCookie(name));
  // Recarrega na rota pública: limpa cache do Apollo e estado em memória.
  window.location.replace("/login");
};
