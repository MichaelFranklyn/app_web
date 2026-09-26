import { ActionBar } from "./ActionBar";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Main } from "./Main";
import { Root } from "./Root";

/**
 * Casca das telas abertas por link, fora do app: portal do cliente (`/p`) e
 * folha de resposta da rota (`/r`). Sem sidebar nem topbar — quem abre não tem
 * conta —, só cabeçalho de identificação, corpo e rodapé na mesma largura.
 */
export const PublicPage = Object.assign(Root, {
  Root,
  Header,
  Main,
  Footer,
  ActionBar,
});
